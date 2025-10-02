import { Card, Button } from "antd";
import styles from "./CanvasList.module.css";

type Props = {
  onClick: () => void;
};

export default function CreateCanvasCard({ onClick }: Props) {
  return (
    <Card hoverable className={styles.canvasCard} styles={{ body: { padding: 0 }}}>
      <Button type="dashed" className={styles.createButton} onClick={onClick}>
        + Create New Canvas
      </Button>
    </Card>
  );
}
