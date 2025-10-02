import { Card, Button } from "antd";
import { Link } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import styles from "./CanvasList.module.css";

type CanvasProps = {
  _id: string;
  name?: string;
  createdAt: string;
  image?: string;
  onDelete?: (id: string) => void;
};

export default function CanvasCard({ _id, name, createdAt, image, onDelete }: CanvasProps) {
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
        <div className={styles.overlayActions}>
          <Link to={`/editor?canvasId=${_id}`}>
            <Button type="primary" size="large" className={styles.openButton}>Open</Button>
          </Link>
          {onDelete && (
              <Button size="large"danger icon={<DeleteOutlined />} className={styles.deleteButton} onClick={() => onDelete(_id)}>
              </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
