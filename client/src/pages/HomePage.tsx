import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, message, Typography } from "antd";
import CanvasList from "../components/CanvasList/CanvasList";
import CreateCanvasModal from "../components/CreateCanvasModal/CreateCanvasModal";
import api  from "../api"; 

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
      const { data } = await api.get("/api/canvas"); // Axios GET
      setCanvases(data);
    } catch (err) {
      console.error(err);
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
      const { data: created } = await api.post("/api/canvas", { name: newCanvasName }); // Axios POST
      message.success("Canvas created!");
      setModalVisible(false);
      setNewCanvasName("");
      navigate(`/editor?canvasId=${created._id}`);
    } catch (err) {
      console.error(err);
      message.error("Failed to create canvas");
    }
  };

  const deleteCanvas = async (id: string) => {
    try {
      await api.delete(`/api/canvas/${id}`); // Axios DELETE
      message.success("Canvas deleted");
      setCanvases((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.error || "Failed to delete canvas");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>My Canvases</Title>
      {loading ? (
        <Spin />
      ) : (
        <CanvasList canvases={canvases} onCreateClick={() => setModalVisible(true)} onDelete={deleteCanvas} />
      )}
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
