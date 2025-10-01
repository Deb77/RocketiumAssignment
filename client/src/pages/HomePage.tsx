import { useEffect, useState } from "react";
import {
  List,
  Button,
  Card,
  Spin,
  message,
  Typography,
  Modal,
  Input,
} from "antd";
import { Link, useNavigate } from "react-router-dom";

type Canvas = {
  _id: string;
  name?: string;
  createdAt: string;
  image?: string; // base64 image string
};

const { Title } = Typography;

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
    if (!newCanvasName.trim()) {
      message.error("Please enter a name");
      return;
    }

    try {
      const res = await fetch("http://localhost:9000/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCanvasName }),
      });
      if (!res.ok) throw new Error("Failed to create canvas");
      const created = await res.json();
      message.success("Canvas created!");
      setModalVisible(false);
      setNewCanvasName("");
      navigate(`/editor?canvasId=${created._id}`);
    } catch (err) {
      console.error(err);
      message.error("Failed to create canvas");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>My Canvases</Title>
      {loading ? (
        <Spin />
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={[{ isNew: true }, ...canvases]}
          renderItem={(item) => {
            // Type guard for the "new" card
            const isNew = (item as any).isNew === true;
            const canvas = item as Canvas;
            return (
              <List.Item>
                <Card
                  hoverable
                  style={{
                    height: 220,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    padding: 0,
                  }}
                  bodyStyle={{ padding: 0, width: "100%", height: "100%" }}
                >
                  {isNew ? (
                    <Button
                      type="dashed"
                      style={{ width: "100%", height: "100%" }}
                      onClick={() => setModalVisible(true)}
                    >
                      + Create New Canvas
                    </Button>
                  ) : (
                    <>
                      {canvas.image && (
                        <img
                          src={
                            canvas.image.startsWith("data:image")
                              ? canvas.image
                              : `data:image/png;base64,${canvas.image}`
                          }
                          alt={canvas.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {/* Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "50%",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          display: "flex",
                          // flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ textAlign: "left", padding: "0 8px" }}>
                          <div style={{ fontWeight: "bold" }}>
                            {canvas.name || "Untitled"}
                          </div>
                          <div style={{ fontSize: 12 }}>
                            Created: {new Date(canvas.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <Link to={`/editor?canvasId=${canvas._id}`} style={{ padding: "0 8px" }}>
                          <Button
                            type="primary"
                            size="large"
                          >
                            Open
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </Card>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title="Create New Canvas"
        open={modalVisible}
        onOk={handleCreateCanvas}
        onCancel={() => setModalVisible(false)}
        okText="Create"
      >
        <Input
          placeholder="Canvas name"
          value={newCanvasName}
          onChange={(e) => setNewCanvasName(e.target.value)}
          onPressEnter={handleCreateCanvas}
        />
      </Modal>
    </div>
  );
}
