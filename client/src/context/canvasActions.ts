import * as fabric from "fabric";

export const addRectangle = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const rect = new fabric.Rect({ top: 100, left: 50, width: 100, height: 60, fill: "#D84D42" });
  canvas.add(rect);
};

export const addCircle = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const circle = new fabric.Circle({ top: 100, left: 50, radius: 50, fill: "#4287f5" });
  canvas.add(circle);
};

export const addText = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const text = new fabric.Textbox("New Text", { top: 150, left: 50, width: 200, fontSize: 20, fill: "#000" });
  canvas.add(text);
};

export const addImage = async (canvas: fabric.Canvas | null, url: string) => {
  if (!canvas) return;
  const image = await fabric.FabricImage.fromURL(url, { crossOrigin: null }, { top: 100, left: 150, scaleX: 0.25, scaleY: 0.25 });
  canvas.add(image);
};

export const updateProperty = (canvas: fabric.Canvas | null, selectedObject: fabric.FabricObject | null, prop: string, value: any) => {
  if (!canvas || !selectedObject) return;
  selectedObject.set(prop as any, value);
  selectedObject.setCoords();
  canvas.renderAll();
  canvas.fire("object:modified", { target: selectedObject });
};

export const updateCanvasHeight = (canvas: fabric.Canvas | null, newCanvasHeight: number | null) => {
  if (!canvas || newCanvasHeight == null) return;
  const anyCanvas = canvas as any;
  if (!anyCanvas.lowerCanvasEl) return;
  const h = Math.max(100, Math.min(2000, Number(newCanvasHeight)));
  canvas.setDimensions({ height: h });
  canvas.requestRenderAll();
};

export const updateCanvasWidth = (canvas: fabric.Canvas | null, newCanvasWidth: number | null) => {
  if (!canvas || newCanvasWidth == null) return;
  const anyCanvas = canvas as any;
  if (!anyCanvas.lowerCanvasEl) return;
  const w = Math.max(100, Math.min(2000, Number(newCanvasWidth)));
  canvas.setDimensions({ width: w });
  canvas.requestRenderAll();
};

export const downloadCanvasAsImage = (canvas: fabric.Canvas | null, filename?: string) => {
  if (!canvas) return;
  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename || "canvas.png";
  link.click();
};
