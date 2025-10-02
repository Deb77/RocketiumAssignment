import { List } from "antd";
import CanvasCard from "./CanvasCard";
import CreateCanvasCard from "./CreateCanvasCard";

type Canvas = {
  _id: string;
  name?: string;
  createdAt: string;
  image?: string;
};

type Props = {
  canvases: Canvas[];
  onCreateClick: () => void;
  onDelete?: (id: string) => void;
};

export default function CanvasList({ canvases, onCreateClick, onDelete }: Props) {
  return (
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={[{ isNew: true }, ...canvases]}
      renderItem={(item: any) => (
        <List.Item>
          {item.isNew ? (
            <CreateCanvasCard onClick={onCreateClick} />
          ) : (
            <CanvasCard {...item} onDelete={onDelete} />
          )}
        </List.Item>
      )}
      rowKey={(item) => item._id || "new"}
    />
  );
}
