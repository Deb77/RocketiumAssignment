import { useRef, useEffect, useState } from "react";
import { Canvas } from "fabric";
import {
  handleObjectMoving,
  clearGuidelines,
} from "../helpers/snappingHelpers";
import { useCanvas } from "../context/CanvasContext";

function CanvasBoard() {
  const canvasRef = useRef(null);
  const [guidelines, setGuidelines] = useState([]);
  const { setCanvas } = useCanvas();

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 500,
        height: 500,
      });

      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();
      setCanvas(initCanvas);

      initCanvas.on("object:moving", (event) =>
        handleObjectMoving(initCanvas, event.target, guidelines, setGuidelines)
      );

      initCanvas.on("object:modified", () => clearGuidelines(initCanvas));

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  return (
    <div
      className="app"
      style={{
        background: "#f1f1f1",
        height: "calc(100vh - 65px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas id="canvas" ref={canvasRef}></canvas>{" "}
    </div>
  );
}

export default CanvasBoard;
