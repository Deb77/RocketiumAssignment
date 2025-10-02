import { Card, Button } from "antd";
import { Link } from "react-router-dom";
import styles from "./CanvasList.module.css";

type CanvasProps = {
  _id: string;
  name?: string;
  createdAt: string;
  image?: string;
};

export default function CanvasCard({ _id, name, createdAt, image }: CanvasProps) {
  return (
    <Card hoverable className={styles.canvasCard} bodyStyle={{ padding: 0 }}>
      {image && (
        <img
          src={image.startsWith("data:image") ? image : `data:image/png;base64,${image}`}
          alt={name}
          className={styles.canvasImage}
        />
      )}

      <div className={styles.overlay}>
        <div className={styles.overlayText}>
          <div className={styles.canvasName}>{name || "Untitled"}</div>
          <div className={styles.canvasDate}>{new Date(createdAt).toLocaleString()}</div>
        </div>

        <Link to={`/editor?canvasId=${_id}`}>
          <Button type="primary" size="large" className={styles.openButton}>Open</Button>
        </Link>
      </div>
    </Card>
  );
}
