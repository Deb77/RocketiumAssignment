import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Socket } from "socket.io-client";
import * as fabric from "fabric";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "../store";
import { CanvasActionsContext, CanvasStateContext } from "./CanvasContexts";
import { SERVER_URL } from "./constants";
import type {
  CanvasActionsContextType,
  CanvasStateContextType,
  LayeredObject,
} from "./types";
import { useCanvasHistory } from "./useCanvasHistory";
import { useCanvasSocket } from "./useCanvasSocket";
import {
  addCircle as addCircleHelper,
  addImage as addImageHelper,
  addRectangle as addRectangleHelper,
  addText as addTextHelper,
  downloadCanvasAsImage as downloadCanvasAsImageHelper,
  updateCanvasHeight as updateCanvasHeightHelper,
  updateCanvasWidth as updateCanvasWidthHelper,
  updateProperty as updatePropertyHelper,
} from "./canvasActions";

interface CanvasProviderProps {
  children: React.ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] =
    useState<fabric.FabricObject | null>(null);
  // const [version, setVersion] = useState(1); -> not sure why i added this initially
  const [layers, setLayers] = useState<LayeredObject[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const { canvasWidth, canvasHeight } = useAppSelector((s) => s.ui);
  const token = useAppSelector((s) => s.auth.token);
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );
  const dispatch = useAppDispatch();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const canvasId = query.get("canvasId");

  const updateZIndices = useCallback(() => {
    if (!canvas) return;
    const objects = canvas.getObjects() as LayeredObject[];
    objects.forEach((obj, idx) => {
      if (!obj.id) obj.id = `${obj.type}_${uuidv4()}`;
      obj.zIndex = idx;
      if (!obj.name) obj.name = `${obj.type}_${idx}`;
    });
  }, [canvas]);

  const updateLayers = useCallback(() => {
    if (!canvas) return;
    updateZIndices();
    const objects = canvas.getObjects() as LayeredObject[];
    const objs = objects.filter(
      (obj) =>
        !(obj.id?.startsWith("vertical-") || obj.id?.startsWith("horizontal-"))
    );
    setLayers([...objs].reverse());
  }, [canvas, updateZIndices]);

  const deleteLayer = useCallback(
    (layerId?: string) => {
      if (!canvas || !layerId) return;
      const obj = canvas.getObjects().find((o: any) => o.id === layerId);
      if (!obj) return;
      canvas.remove(obj);
      canvas.renderAll();
    },
    [canvas]
  );

  const selectLayer = useCallback(
    (layerId?: string) => {
      if (!canvas) return;
      const objects = canvas.getObjects() as LayeredObject[];
      const object = objects.find((obj) => obj.id === layerId);
      if (object) {
        canvas.setActiveObject(object);
        canvas.renderAll();
        if (layerId) setSelectedLayerId(layerId);
      }
    },
    [canvas]
  );

  const moveLayer = useCallback(
    (direction: "up" | "down", layerId?: string) => {
      if (!canvas) return;
      const objects = canvas.getObjects() as LayeredObject[];
      const idx = objects.findIndex((obj) => obj.id === layerId);
      if (idx === -1) return;

      const backgroundColor = canvas.backgroundColor as any;
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
    },
    [canvas, updateLayers]
  );

  const {
    saveHistory,
    undo,
    redo,
    attachHistoryListeners,
    detachHistoryListeners,
  } = useCanvasHistory({
    canvas,
    canvasId,
    socketRef,
    dispatch,
    updateLayers,
  });

  useCanvasSocket({
    canvas,
    canvasId,
    socketRef,
    attachHistoryListeners,
    detachHistoryListeners,
    saveHistory,
    updateLayers,
  });

  useEffect(() => {
    if (!canvas || !canvasId) return;

    const loadCanvas = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/canvas/${canvasId}`, {
          headers: { ...authHeaders },
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
  }, [
    canvas,
    canvasId,
    authHeaders,
    updateLayers,
    saveHistory,
    attachHistoryListeners,
    detachHistoryListeners,
  ]);

  console.log("selection", selectedObject);
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
        // setVersion((prev) => prev + 1);
      },
    } as const;

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
  }, [canvas, updateLayers]);

  const addRectangle = useCallback(() => addRectangleHelper(canvas), [canvas]);
  const addCircle = useCallback(() => addCircleHelper(canvas), [canvas]);
  const addText = useCallback(() => addTextHelper(canvas), [canvas]);
  const addImage = useCallback(
    (url: string) => {
      void addImageHelper(canvas, url);
    },
    [canvas]
  );

  const updateProperty = useCallback(
    (prop: string, value: any) => {
      if (!canvas) return;
      const activeObj = canvas.getActiveObject();
      if (!activeObj) return;

      updatePropertyHelper(canvas, activeObj, prop, value);
    },
    [canvas]
  );

  const renameLayer = useCallback(
    (layerId: string | null, newName: string) => {
      if (!canvas || !layerId) return;

      // Find the correct fabric object by id
      const object = (canvas.getObjects() as LayeredObject[]).find(
        (obj) => obj.id === layerId
      );

      if (!object) return;

      // Update its name
      object.name = newName;

      // Re-render canvas & refresh layer state
      canvas.renderAll();
      updateLayers();
    },
    [canvas, updateLayers]
  );

  const updateCanvasHeight = useCallback(
    (newCanvasHeight: number | null) => {
      updateCanvasHeightHelper(canvas, newCanvasHeight);
    },
    [canvas]
  );

  const updateCanvasWidth = useCallback(
    (newCanvasWidth: number | null) => {
      updateCanvasWidthHelper(canvas, newCanvasWidth);
    },
    [canvas]
  );

  const downloadCanvasAsImage = useCallback(
    (filename?: string) => {
      downloadCanvasAsImageHelper(canvas, filename);
    },
    [canvas]
  );

  const saveCanvas = useCallback(async () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const imageUrl = canvas.toDataURL();

    await fetch(`${SERVER_URL}/api/canvas/${canvasId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ id: canvasId, data: json, image: imageUrl }),
    });
  }, [canvas, canvasId, authHeaders]);

  useEffect(() => {
    if (canvasWidth != null) updateCanvasWidth(canvasWidth);
  }, [canvasWidth, updateCanvasWidth]);

  useEffect(() => {
    if (canvasHeight != null) updateCanvasHeight(canvasHeight);
  }, [canvasHeight, updateCanvasHeight]);

  const stateValue = useMemo<CanvasStateContextType>(
    () => ({
      canvas,
      setCanvas,
      selectedObject,
      // version,
      layers,
      selectedLayerId,
    }),
    [canvas, selectedObject, layers, selectedLayerId]
  );

  const actionsValue = useMemo<CanvasActionsContextType>(
    () => ({
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
      deleteLayer,
      renameLayer,
    }),
    [canvas]
  );

  return (
    <CanvasActionsContext.Provider value={actionsValue}>
      <CanvasStateContext.Provider value={stateValue}>
        {children}
      </CanvasStateContext.Provider>
    </CanvasActionsContext.Provider>
  );
};
