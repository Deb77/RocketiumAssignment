import { Modal, Input } from "antd";
import styles from "./CreateCanvasModal.module.css";

type Props = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  value: string;
  onChange: (val: string) => void;
  onPressEnter?: () => void;
};

export default function CreateCanvasModal({ visible, onOk, onCancel, value, onChange, onPressEnter }: Props) {
  return (
    <Modal title="Create New Canvas" open={visible} onOk={onOk} onCancel={onCancel} okText="Create">
      <Input
        placeholder="Canvas name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onPressEnter}
        className={styles.input}
      />
    </Modal>
  );
}