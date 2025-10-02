import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import * as fabric from "fabric";
import { SERVER_URL } from "./constants";

interface Args {
  canvas: fabric.Canvas | null;
  canvasId: string | null;
  socketRef: React.MutableRefObject<Socket | null>;
  attachHistoryListeners: () => void;
  detachHistoryListeners: () => void;
  saveHistory: () => void;
  updateLayers: () => void;
}

export const useCanvasSocket = ({ canvas, canvasId, socketRef, attachHistoryListeners, detachHistoryListeners, saveHistory, updateLayers }: Args) => {
  // Init and join room
  useEffect(() => {
    if (!canvas || !canvasId) return;

    const s = io(SERVER_URL);
    socketRef.current = s;
    s.emit("join-canvas", canvasId);

    return () => {
      s.disconnect();
    };
  }, [canvas, canvasId]);

  // Listen for remote updates
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
  }, [canvas, canvasId, attachHistoryListeners, detachHistoryListeners, saveHistory, updateLayers]);
};
