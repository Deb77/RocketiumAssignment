import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, message, Typography } from "antd";
import CanvasList from "../components/CanvasList/CanvasList";
import CreateCanvasModal from "../components/CreateCanvasModal/CreateCanvasModal";

const { Title } = Typography;

type Canvas = {
  _id: string;
  name?: string;
  createdAt: string;
  image?: string;
};

export default function HomePage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState("");
  const navigate = useNavigate();

  const fetchCanvases = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:9000/api/canvas");
      if (!res.ok) throw new Error("Failed to fetch canvases");
      const data = await res.json();
      setCanvases(data);
    } catch {
      message.error("Could not load canvases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, []);

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) return message.error("Please enter a name");

    try {
      const res = await fetch("http://localhost:9000/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCanvasName }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      message.success("Canvas created!");
      setModalVisible(false);
      setNewCanvasName("");
      navigate(`/editor?canvasId=${created._id}`);
    } catch {
      message.error("Failed to create canvas");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>My Canvases</Title>
      {loading ? <Spin /> : <CanvasList canvases={canvases} onCreateClick={() => setModalVisible(true)} />}
      <CreateCanvasModal
        visible={modalVisible}
        onOk={handleCreateCanvas}
        onCancel={() => setModalVisible(false)}
        value={newCanvasName}
        onChange={setNewCanvasName}
        onPressEnter={handleCreateCanvas}
      />
    </div>
  );
}
