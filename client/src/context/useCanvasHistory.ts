import { useCallback, useRef } from "react";
import type { Dispatch } from "react";
import type { Socket } from "socket.io-client";
import * as fabric from "fabric";
import { setHistoryFlags } from "../store/uiSlice";

interface Args {
  canvas: fabric.Canvas | null;
  canvasId: string | null;
  socketRef: React.MutableRefObject<Socket | null>;
  dispatch: Dispatch<any>;
  updateLayers: () => void;
}

export const useCanvasHistory = ({ canvas, canvasId, socketRef, dispatch, updateLayers }: Args) => {
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);

  const updateHistoryFlags = useCallback(() => {
    dispatch(
      setHistoryFlags({
        isHistoryEmpty: historyRef.current.length <= 1,
        isRedoEmpty: redoRef.current.length === 0,
      })
    );
  }, [dispatch]);

  const saveHistory = useCallback(() => {
    if (!canvas) return;
    const json = canvas.toJSON();
    historyRef.current = [...historyRef.current, JSON.stringify(json)];
    redoRef.current = [];
    updateHistoryFlags();
  }, [canvas, updateHistoryFlags]);

  const handleObjectMutation = useCallback(() => {
    if (!canvas || !canvasId) return;
    saveHistory();
    updateLayers();
    socketRef.current?.emit("canvas-update", { canvasId, json: JSON.stringify(canvas.toJSON()) });
  }, [canvas, canvasId, updateLayers, saveHistory, socketRef]);

  const attachHistoryListeners = useCallback(() => {
    if (!canvas) return;
    canvas.on("object:added", handleObjectMutation);
    canvas.on("object:modified", handleObjectMutation);
    canvas.on("object:removed", handleObjectMutation);
  }, [canvas, handleObjectMutation]);

  const detachHistoryListeners = useCallback(() => {
    if (!canvas) return;
    canvas.off("object:added");
    canvas.off("object:modified");
    canvas.off("object:removed");
  }, [canvas]);

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
      updateHistoryFlags();
    }
  }, [canvas, canvasId, detachHistoryListeners, attachHistoryListeners, updateLayers, updateHistoryFlags, socketRef]);

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
      updateHistoryFlags();
    }
  }, [canvas, canvasId, detachHistoryListeners, attachHistoryListeners, updateLayers, updateHistoryFlags, socketRef]);

  return { saveHistory, undo, redo, attachHistoryListeners, detachHistoryListeners };
};
