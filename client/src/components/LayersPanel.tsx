import { List, Button, Typography, Divider } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useCanvas } from "../context/CanvasContext";
import Sider from "antd/es/layout/Sider";

const { Text } = Typography;

const LayerPanel = () => {
  const { layers, selectedLayerId, selectLayer, moveLayer } = useCanvas();

  return (
    <Sider theme="light" style={{ padding: 16 }}>
      <Text strong style={{ fontSize: 16 }}>
        Layers
      </Text>
      <Divider />
      <List
        dataSource={layers}
        renderItem={(layer) => (
          <List.Item
            style={{
              background:
                layer.id === selectedLayerId ? "#e6f7ff" : "transparent",
              borderRadius: 4,
              marginBottom: 4,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 8px",
            }}
            onClick={() => selectLayer(layer.id)}
          >
            <span>
              {layer.type} (#{layer.zIndex})
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <Button
                size="small"
                icon={<UpOutlined />}
                onClick={() => moveLayer("up", layer.id)}
              />
              <Button
                size="small"
                icon={<DownOutlined />}
                onClick={() => moveLayer("down", layer.id)}
              />
            </div>
          </List.Item>
        )}
      />
    </Sider>
  );
};

export default LayerPanel;
