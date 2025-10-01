import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as fabric from "fabric";
import { useLocation } from "react-router-dom";

interface LayeredObject extends fabric.FabricObject {
  id?: string;
  zIndex?: number;
}

// Context type
interface CanvasContextType {
  canvas: fabric.Canvas | null;
  setCanvas: React.Dispatch<React.SetStateAction<fabric.Canvas | null>>;
  addRectangle: () => void;
  addCircle: () => void;
  addText: () => void;
  addImage: (url: string) => void;
  selectedObject: fabric.FabricObject | null;
  updateProperty: (prop: string, value: any) => void;
  version: number;
  updateCanvasHeight: (newCanvasHeight: number | null) => void;
  updateCanvasWidth: (newCanvasWidth: number | null) => void;
  layers: LayeredObject[];
  selectedLayerId: string | null;
  selectLayer: (id?: string) => void;
  moveLayer: (direction: "up" | "down", id?: string) => void;
  undo: () => void;
  redo: () => void;
  isHistoryEmpty: boolean;
  isRedoEmpty: boolean;
  downloadCanvasAsImage: (filename?: string) => void;
  saveCanvas: () => Promise<void>;
}

// Create context
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// Provider props
interface CanvasProviderProps {
  children: ReactNode;
}

// Provider
export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] =
    useState<fabric.FabricObject | null>(null);
  const [version, setVersion] = useState(1);
  const [layers, setLayers] = useState<LayeredObject[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const canvasId = query.get("canvasId");

  // Update zIndex for canvas objects
  const updateZIndices = () => {
    if (!canvas) return;

    const objects = canvas.getObjects() as LayeredObject[];
    objects.forEach((obj, idx) => {
      if (!obj.id) obj.id = `${obj.type}_${Date.now()}`;
      obj.zIndex = idx;
    });
  };

  // Refresh layer state
  const updateLayers = () => {
    if (!canvas) return;
    updateZIndices();

    const objects = canvas.getObjects() as LayeredObject[];
    const objs = objects.filter(
      (obj) =>
        !(obj.id?.startsWith("vertical-") || obj.id?.startsWith("horizontal-"))
    );

    setLayers([...objs].reverse()); // store actual objects
  };

  // Select layer
  const selectLayer = (layerId?: string) => {
    if (!canvas) return;
    const objects = canvas.getObjects() as LayeredObject[];
    const object = objects.find((obj) => obj.id === layerId);
    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
      if (layerId) {
        setSelectedLayerId(layerId);
      }
    }
  };

  // Move layer
  const moveLayer = (direction: "up" | "down", layerId?: string) => {
    if (!canvas) return;
    const objects = canvas.getObjects() as LayeredObject[];
    const idx = objects.findIndex((obj) => obj.id === layerId);
    if (idx === -1) return;

    const backgroundColor = canvas.backgroundColor;

    const newIdx =
      direction === "up"
        ? Math.min(idx + 1, objects.length - 1)
        : Math.max(idx - 1, 0);
    [objects[idx], objects[newIdx]] = [objects[newIdx], objects[idx]];

    canvas.clear();
    objects.forEach((obj) => canvas.add(obj));
    canvas.backgroundColor = backgroundColor;
    canvas.renderAll();
    updateLayers();
    canvas.setActiveObject(objects[newIdx]);
  };

  const saveHistory = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    setHistory((prev) => [...prev, JSON.stringify(json)]);
    setRedoStack([]); // clear redo stack on new action
  };

  useEffect(() => {
  if (!canvas || !canvasId) return;

  const loadCanvas = async () => {
    try {
      const res = await fetch(`http://localhost:9000/api/canvas/${canvasId}`);
      if (!res.ok) throw new Error("Canvas not found");
      const data = await res.json();

      detachHistoryListeners();
      await canvas.loadFromJSON(data.data);
        canvas.renderAll();
        saveHistory(); 
      attachHistoryListeners();
      updateLayers();
    } catch (err) {
      console.error(err);
    }
  };

  loadCanvas();
}, [canvas, canvasId]);

  const objCallbacks = () => {
    if (!canvas) return;
    saveHistory();
    updateLayers();
  };

  const attachHistoryListeners = () => {
    if (!canvas) return;
    canvas.on("object:added", objCallbacks);
    canvas.on("object:modified", objCallbacks);
    canvas.on("object:removed", objCallbacks);
  };

  const detachHistoryListeners = () => {
    if (!canvas) return;
    canvas.off("object:added");
    canvas.off("object:modified");
    canvas.off("object:removed");
  };

  const saveCanvas = async () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const imageUrl = canvas.toDataURL();

    await fetch(`http://localhost:9000/api/canvas/${canvasId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: canvasId,
        data: json,
        image: imageUrl
      }),
    });
  };

  useEffect(() => {
    if (!canvas) return;

    const handlers = {
      "object:added": updateLayers,
      "object:removed": updateLayers,
      "object:modified": updateLayers,
      "selection:created": (e: any) => {
        setSelectedLayerId(e.selected[0]?.id || null);
        setSelectedObject(e.selected[0]);
      },
      "selection:updated": (e: any) => {
        setSelectedLayerId(e.selected[0]?.id || null);
        setSelectedObject(e.selected[0]);
      },
      "selection:cleared": () => {
        setSelectedLayerId(null);
        setSelectedObject(null);
      },
      "object:scaling": (e: any) => {
        setSelectedObject(e.target);
        setVersion((prev) => prev + 1);
      },
    };

    (
      Object.entries(handlers) as [
        keyof fabric.CanvasEvents,
        (e: any) => void
      ][]
    ).forEach(([event, fn]) => canvas.on(event, fn));
    updateLayers();

    return () =>
      (
        Object.entries(handlers) as [
          keyof fabric.CanvasEvents,
          (e: any) => void
        ][]
      ).forEach(([event, fn]) => canvas.off(event, fn));
  }, [canvas]);

  const undo = async () => {
    if (!canvas || history.length <= 1) return;

    const newHistory = [...history];
    const currentState = newHistory.pop()!; // this is the state being undone
    const prevState = newHistory[newHistory.length - 1];

    // push the current state to redoStack so redo can bring it back
    setRedoStack((prev) => [...prev, currentState]);
    setHistory(newHistory);

    try {
      detachHistoryListeners();
      await canvas.loadFromJSON(prevState);
      canvas.renderAll();
    } finally {
      attachHistoryListeners();
      updateLayers();
    }
  };

  const redo = async () => {
    if (!canvas || redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const redoState = newRedoStack.pop()!;

    // Save current state to history BEFORE applying redo
    setHistory((prev) => [...prev, redoState]);
    setRedoStack(newRedoStack);

    try {
      detachHistoryListeners();
      await canvas.loadFromJSON(redoState);
      canvas.renderAll();
    } finally {
      attachHistoryListeners();
      updateLayers();
    }
  };

  // Add rectangle
  const addRectangle = () => {
    if (canvas) {
      const rect = new fabric.Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: "#D84D42",
      });
      canvas.add(rect);
    }
  };

  // Add circle
  const addCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        top: 100,
        left: 50,
        radius: 50,
        fill: "#4287f5",
      });
      canvas.add(circle);
    }
  };

  // Add text
  const addText = () => {
    if (canvas) {
      const text = new fabric.Textbox("New Text", {
        top: 150,
        left: 50,
        width: 200,
        fontSize: 20,
        fill: "#000",
      });
      canvas.add(text);
    }
  };

  const addImage = async (url: string) => {
    if (canvas) {
      const image = await fabric.FabricImage.fromURL(
        url,
        {
          crossOrigin: null,
        },
        {
          top: 100,
          left: 150,
          scaleX: 0.25,
          scaleY: 0.25,
        }
      );
      canvas.add(image);
    }
  };

  const updateProperty = (prop: string, value: any) => {
    if (!selectedObject) return;
    selectedObject?.set(prop as any, value);
    selectedObject?.setCoords();
    canvas?.renderAll();
    canvas?.fire("object:modified", { target: selectedObject });
  };

  const updateCanvasHeight = (newCanvasHeight: number | null) => {
    // TODO: fix -> crashing sometimes
    // if (canvas) {
    //   canvas.setWidth(Number(newCanvasHeight));
    //   canvas.renderAll();
    // }
  };

  const updateCanvasWidth = (newCanvasWidth: number | null) => {
    // TODO: fix -> crashing sometimes
    // if (canvas) {
    //   canvas.setWidth(Number(newCanvasWidth));
    //   canvas.renderAll();
    // }
  };

  const downloadCanvasAsImage = (filename: string = "canvas.png") => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL();

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;

    link.click();
  };

  const value: CanvasContextType = {
    canvas,
    setCanvas,
    addRectangle,
    addCircle,
    addText,
    addImage,
    selectedObject,
    updateProperty,
    version,
    updateCanvasHeight,
    updateCanvasWidth,
    layers,
    moveLayer,
    selectedLayerId,
    selectLayer,
    undo,
    redo,
    isHistoryEmpty: history.length === 1,
    isRedoEmpty: redoStack.length === 0,
    downloadCanvasAsImage,
    saveCanvas,
  };

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

// Hook to consume the context
export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
