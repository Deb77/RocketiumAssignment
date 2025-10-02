import * as fabric from "fabric";
import {
  CANVAS_MAX_SIZE,
  CANVAS_MIN_SIZE,
  CIRCLE_DEFAULTS,
  EXPORT_DEFAULTS,
  IMAGE_DEFAULTS,
  RECT_DEFAULTS,
  TEXT_DEFAULTS,
} from "./constants";

export const addRectangle = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const rect = new fabric.Rect({ ...RECT_DEFAULTS });
  canvas.add(rect);
};

export const addCircle = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const circle = new fabric.Circle({ ...CIRCLE_DEFAULTS });
  canvas.add(circle);
};

export const addText = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const { text, ...rest } = TEXT_DEFAULTS;
  const textbox = new fabric.Textbox(text, { ...rest });
  canvas.add(textbox);
};

export const addImage = async (canvas: fabric.Canvas | null, url: string) => {
  if (!canvas) return;
  const image = await fabric.FabricImage.fromURL(url, { crossOrigin: null }, { ...IMAGE_DEFAULTS });
  canvas.add(image);
};

export const updateProperty = (
  canvas: fabric.Canvas | null,
  selectedObject: fabric.FabricObject | null,
  prop: string,
  value: any
) => {
  if (!canvas || !selectedObject) return;
  selectedObject.set(prop as any, value);
  selectedObject.setCoords();
  canvas.renderAll();
  canvas.fire("object:modified", { target: selectedObject });
};

export const updateCanvasHeight = (
  canvas: fabric.Canvas | null,
  newCanvasHeight: number | null
) => {
  if (!canvas || newCanvasHeight == null) return;
  const anyCanvas = canvas as any;
  if (!anyCanvas.lowerCanvasEl) return;
  const h = Math.max(CANVAS_MIN_SIZE, Math.min(CANVAS_MAX_SIZE, Number(newCanvasHeight)));
  canvas.setDimensions({ height: h });
  canvas.requestRenderAll();
};

export const updateCanvasWidth = (
  canvas: fabric.Canvas | null,
  newCanvasWidth: number | null
) => {
  if (!canvas || newCanvasWidth == null) return;
  const anyCanvas = canvas as any;
  if (!anyCanvas.lowerCanvasEl) return;
  const w = Math.max(CANVAS_MIN_SIZE, Math.min(CANVAS_MAX_SIZE, Number(newCanvasWidth)));
  canvas.setDimensions({ width: w });
  canvas.requestRenderAll();
};

export const downloadCanvasAsImage = (
  canvas: fabric.Canvas | null,
  filename?: string
) => {
  if (!canvas) return;
  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename || EXPORT_DEFAULTS.filename;
  link.click();
};
