import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import type { ReactNode } from "react";
import * as fabric from "fabric";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { setHistoryFlags } from "../store/uiSlice";

interface LayeredObject extends fabric.FabricObject {
  id?: string;
  zIndex?: number;
}

interface CanvasStateContextType {
  canvas: fabric.Canvas | null;
  setCanvas: React.Dispatch<React.SetStateAction<fabric.Canvas | null>>;
  selectedObject: fabric.FabricObject | null;
  version: number;
  layers: LayeredObject[];
  selectedLayerId: string | null;
}

interface CanvasActionsContextType {
  addRectangle: () => void;
  addCircle: () => void;
  addText: () => void;
  addImage: (url: string) => void;
  updateProperty: (prop: string, value: any) => void;
  updateCanvasHeight: (newCanvasHeight: number | null) => void;
  updateCanvasWidth: (newCanvasWidth: number | null) => void;
  selectLayer: (id?: string) => void;
  moveLayer: (direction: "up" | "down", id?: string) => void;
  undo: () => void;
  redo: () => void;
  downloadCanvasAsImage: (filename?: string) => void;
  saveCanvas: () => Promise<void>;
}

const CanvasStateContext = createContext<CanvasStateContextType | undefined>(undefined);
const CanvasActionsContext = createContext<CanvasActionsContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [version, setVersion] = useState(1);
  const [layers, setLayers] = useState<LayeredObject[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const { canvasWidth, canvasHeight } = useAppSelector((s) => s.ui);
  const token = useAppSelector((s) => s.auth.token);
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  const dispatch = useAppDispatch();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const canvasId = query.get("canvasId");

  const updateZIndices = useCallback(() => {
    if (!canvas) return;
    const objects = canvas.getObjects() as LayeredObject[];
    objects.forEach((obj, idx) => {
      if (!obj.id) obj.id = `${obj.type}_${Date.now()}`;
      obj.zIndex = idx;
    });
  }, [canvas]);

  const updateLayers = useCallback(() => {
    if (!canvas) return;
    updateZIndices();
    const objects = canvas.getObjects() as LayeredObject[];
    const objs = objects.filter(
      (obj) => !(obj.id?.startsWith("vertical-") || obj.id?.startsWith("horizontal-"))
    );
    setLayers([...objs].reverse());
  }, [canvas, updateZIndices]);

  const selectLayer = useCallback((layerId?: string) => {
    if (!canvas) return;
    const objects = canvas.getObjects() as LayeredObject[];
    const object = objects.find((obj) => obj.id === layerId);
    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
      if (layerId) setSelectedLayerId(layerId);
    }
  }, [canvas]);

  const moveLayer = useCallback((direction: "up" | "down", layerId?: string) => {
    if (!canvas) return;
    const objects = canvas.getObjects() as LayeredObject[];
    const idx = objects.findIndex((obj) => obj.id === layerId);
    if (idx === -1) return;

    const backgroundColor = canvas.backgroundColor as any;
    const newIdx = direction === "up" ? Math.min(idx + 1, objects.length - 1) : Math.max(idx - 1, 0);
    [objects[idx], objects[newIdx]] = [objects[newIdx], objects[idx]];

    canvas.clear();
    objects.forEach((obj) => canvas.add(obj));
    canvas.backgroundColor = backgroundColor;
    canvas.renderAll();
    updateLayers();
    canvas.setActiveObject(objects[newIdx]);
  }, [canvas, updateLayers]);

  const saveHistory = useCallback(() => {
    if (!canvas) return;
    const json = canvas.toJSON();
    historyRef.current = [...historyRef.current, JSON.stringify(json)];
    redoRef.current = [];
    dispatch(
      setHistoryFlags({
        isHistoryEmpty: historyRef.current.length <= 1,
        isRedoEmpty: redoRef.current.length === 0,
      })
    );
  }, [canvas, dispatch]);

  useEffect(() => {
    if (!canvas || !canvasId) return;

    const loadCanvas = async () => {
      try {
        const res = await fetch(`http://localhost:9000/api/canvas/${canvasId}`, {
          headers: {
            ...authHeaders,
          },
        });
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
  }, [canvas, canvasId, updateLayers, saveHistory]);

  useEffect(() => {
    if (!canvas || !canvasId) return;

    const s = io("http://localhost:9000");
    socketRef.current = s;
    s.emit("join-canvas", canvasId);

    return () => {
      s.disconnect();
    };
  }, [canvas, canvasId]);

  useEffect(() => {
    if (!canvas || !canvasId || !socketRef.current) return;

    const socket = socketRef.current;

    socket.on("canvas-update", (payload: { canvasId: string; json: any }) => {
      if (payload.canvasId !== canvasId) return;

      detachHistoryListeners();
      canvas
        .loadFromJSON(payload.json)
        .then(() => {
          canvas.renderAll();
          updateLayers();
          saveHistory();
          attachHistoryListeners();
        })
        .catch(() => {
          attachHistoryListeners();
        });
    });

    return () => {
      socket.off("canvas-update");
    };
  }, [canvas, canvasId, updateLayers, saveHistory]);

  const objCallbacks = useCallback(() => {
    if (!canvas || !canvasId) return;
    saveHistory();
    updateLayers();
    socketRef.current?.emit("canvas-update", { canvasId, json: JSON.stringify(canvas.toJSON()) });
  }, [canvas, canvasId, updateLayers, saveHistory]);

  const attachHistoryListeners = useCallback(() => {
    if (!canvas) return;
    canvas.on("object:added", objCallbacks);
    canvas.on("object:modified", objCallbacks);
    canvas.on("object:removed", objCallbacks);
  }, [canvas, objCallbacks]);

  const detachHistoryListeners = useCallback(() => {
    if (!canvas) return;
    canvas.off("object:added");
    canvas.off("object:modified");
    canvas.off("object:removed");
  }, [canvas]);

  const saveCanvas = useCallback(async () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const imageUrl = canvas.toDataURL();

    await fetch(`http://localhost:9000/api/canvas/${canvasId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ id: canvasId, data: json, image: imageUrl }),
    });
  }, [canvas, canvasId]);

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
    } as const;

    (Object.entries(handlers) as [keyof fabric.CanvasEvents, (e: any) => void][]) 
      .forEach(([event, fn]) => canvas.on(event, fn));
    updateLayers();

    return () =>
      (Object.entries(handlers) as [keyof fabric.CanvasEvents, (e: any) => void][]) 
        .forEach(([event, fn]) => canvas.off(event, fn));
  }, [canvas, updateLayers]);

  const undo = useCallback(async () => {
    if (!canvas || historyRef.current.length <= 1) return;

    const newHistory = [...historyRef.current];
    const currentState = newHistory.pop()!;
    const prevState = newHistory[newHistory.length - 1];

    redoRef.current = [...redoRef.current, currentState];
    historyRef.current = newHistory;

    try {
      detachHistoryListeners();
      await canvas.loadFromJSON(prevState);
      canvas.renderAll();
      socketRef.current?.emit("canvas-update", { canvasId, json: prevState });
    } finally {
      attachHistoryListeners();
      updateLayers();
      dispatch(
        setHistoryFlags({
          isHistoryEmpty: historyRef.current.length <= 1,
          isRedoEmpty: redoRef.current.length === 0,
        })
      );
    }
  }, [canvas, canvasId, detachHistoryListeners, attachHistoryListeners, updateLayers, dispatch]);

  const redo = useCallback(async () => {
    if (!canvas || redoRef.current.length === 0) return;

    const newRedoStack = [...redoRef.current];
    const redoState = newRedoStack.pop()!;

    historyRef.current = [...historyRef.current, redoState];
    redoRef.current = newRedoStack;

    try {
      detachHistoryListeners();
      await canvas.loadFromJSON(redoState);
      canvas.renderAll();
      socketRef.current?.emit("canvas-update", { canvasId, json: redoState });
    } finally {
      attachHistoryListeners();
      updateLayers();
      dispatch(
        setHistoryFlags({
          isHistoryEmpty: historyRef.current.length <= 1,
          isRedoEmpty: redoRef.current.length === 0,
        })
      );
    }
  }, [canvas, canvasId, detachHistoryListeners, attachHistoryListeners, updateLayers, dispatch]);

  const addRectangle = useCallback(() => {
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
  }, [canvas]);

  const addCircle = useCallback(() => {
    if (canvas) {
      const circle = new fabric.Circle({
        top: 100,
        left: 50,
        radius: 50,
        fill: "#4287f5",
      });
      canvas.add(circle);
    }
  }, [canvas]);

  const addText = useCallback(() => {
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
  }, [canvas]);

  const addImage = useCallback(async (url: string) => {
    if (canvas) {
      const image = await fabric.FabricImage.fromURL(
        url,
        { crossOrigin: null },
        { top: 100, left: 150, scaleX: 0.25, scaleY: 0.25 }
      );
      canvas.add(image);
    }
  }, [canvas]);

  const updateProperty = useCallback((prop: string, value: any) => {
    if (!selectedObject) return;
    selectedObject.set(prop as any, value);
    selectedObject.setCoords();
    canvas?.renderAll();
    canvas?.fire("object:modified", { target: selectedObject });
  }, [canvas, selectedObject]);

  const updateCanvasHeight = useCallback((newCanvasHeight: number | null) => {
    if (!canvas || newCanvasHeight == null) return;
    const anyCanvas = canvas as any;
    if (!anyCanvas.lowerCanvasEl) return;
    const h = Math.max(100, Math.min(2000, Number(newCanvasHeight)));
    canvas.setDimensions({ height: h });
    canvas.requestRenderAll();
  }, [canvas]);

  const updateCanvasWidth = useCallback((newCanvasWidth: number | null) => {
    if (!canvas || newCanvasWidth == null) return;
    const anyCanvas = canvas as any;
    if (!anyCanvas.lowerCanvasEl) return;
    const w = Math.max(100, Math.min(2000, Number(newCanvasWidth)));
    canvas.setDimensions({ width: w });
    canvas.requestRenderAll();
  }, [canvas]);

  const downloadCanvasAsImage = useCallback(() => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";
    link.click();
  }, [canvas]);

  useEffect(() => {
    if (canvasWidth != null) updateCanvasWidth(canvasWidth);
  }, [canvasWidth, updateCanvasWidth]);

  useEffect(() => {
    if (canvasHeight != null) updateCanvasHeight(canvasHeight);
  }, [canvasHeight, updateCanvasHeight]);

  const stateValue = useMemo<CanvasStateContextType>(() => ({
    canvas,
    setCanvas,
    selectedObject,
    version,
    layers,
    selectedLayerId,
  }), [canvas, selectedObject, version, layers, selectedLayerId]);

  const actionsValue = useMemo<CanvasActionsContextType>(() => ({
    addRectangle,
    addCircle,
    addText,
    addImage,
    updateProperty,
    updateCanvasHeight,
    updateCanvasWidth,
    selectLayer,
    moveLayer,
    undo,
    redo,
    downloadCanvasAsImage,
    saveCanvas,
  }), [addRectangle, addCircle, addText, addImage, updateProperty, updateCanvasHeight, updateCanvasWidth, selectLayer, moveLayer, undo, redo, saveCanvas, canvas]);

  return (
    <CanvasActionsContext.Provider value={actionsValue}>
      <CanvasStateContext.Provider value={stateValue}>
        {children}
      </CanvasStateContext.Provider>
    </CanvasActionsContext.Provider>
  );
};

export const useCanvas = (): CanvasStateContextType & CanvasActionsContextType => {
  const state = useContext(CanvasStateContext);
  const actions = useContext(CanvasActionsContext);
  if (!state || !actions) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return { ...state, ...actions };
};

export const useCanvasState = (): CanvasStateContextType => {
  const state = useContext(CanvasStateContext);
  if (!state) {
    throw new Error("useCanvasState must be used within a CanvasProvider");
  }
  return state;
};

export const useCanvasActions = (): CanvasActionsContextType => {
  const actions = useContext(CanvasActionsContext);
  if (!actions) {
    throw new Error("useCanvasActions must be used within a CanvasProvider");
  }
  return actions;
};
