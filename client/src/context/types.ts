import type React from "react";
import * as fabric from "fabric";

export interface LayeredObject extends fabric.FabricObject {
  id?: string;
  zIndex?: number;
  name?: string;
}

export interface CanvasStateContextType {
  canvas: fabric.Canvas | null;
  setCanvas: React.Dispatch<React.SetStateAction<fabric.Canvas | null>>;
  selectedObject: fabric.FabricObject | null;
  // version: number;
  layers: LayeredObject[];
  selectedLayerId: string | null;
}

export interface CanvasActionsContextType {
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
  deleteLayer: (id?: string) => void;
  renameLayer: (id: string | null, newName: string) => void;
}
