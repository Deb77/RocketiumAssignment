import { useRef, useEffect, useState } from "react";
import {
  Canvas,
  FabricObject,
  type BasicTransformEvent,
  type TPointerEvent,
} from "fabric";
import { useCanvasState } from "../../context/CanvasContexts";
import {
  handleObjectMoving,
  clearGuidelines,
} from "../../helpers/snappingHelpers";
import styles from "./CanvasBoard.module.css";

function CanvasBoard() {
  const { canvas, setCanvas } = useCanvasState();
  const canvasRef = useRef(null);
  const [guidelines, setGuidelines] = useState([]);
  
  const onObjectMoving = (
    event: BasicTransformEvent<TPointerEvent> & {
      target: FabricObject;
    }
  ) => {
    if (event.target) {
      handleObjectMoving(canvas, event.target, guidelines, setGuidelines);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 500,
        height: 500,
      });

      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();
      setCanvas(initCanvas);

      // initCanvas.on("object:moving", onObjectMoving);

      // initCanvas.on("object:modified", () => clearGuidelines(initCanvas));

      return () => {
        // initCanvas.off("object:moving", onObjectMoving);
        // initCanvas.off("object:modified", () => clearGuidelines(initCanvas));
        initCanvas.dispose();
      };
    }
  }, []);

  return (
    <div className={styles.container}>
      <canvas id="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

export default CanvasBoard;
