import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Typography } from "antd";
import CanvasList from "../components/CanvasList/CanvasList";
import CreateCanvasModal from "../components/CreateCanvasModal/CreateCanvasModal";
import api  from "../api"; 
import { useMessage } from "../context/MessageContext";

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
  const { success, error } = useMessage();

  const fetchCanvases = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/canvas"); // Axios GET
      setCanvases(data);
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to fetch canvases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, []);

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) return error("Please enter a name");

    try {
      const { data: created } = await api.post("/api/canvas", { name: newCanvasName }); // Axios POST
      success("Canvas created!");
      setModalVisible(false);
      setNewCanvasName("");
      navigate(`/editor?canvasId=${created._id}`);
    } catch (err) {
      console.error(err);
      error("Failed to create canvas");
    }
  };

  const deleteCanvas = async (id: string) => {
    try {
      await api.delete(`/api/canvas/${id}`);
      success("Canvas deleted");
      setCanvases((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.error || "Failed to delete canvas");
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
