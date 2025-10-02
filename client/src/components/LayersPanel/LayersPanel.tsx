import { List, Button, Typography, Divider, Layout } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useCanvas } from "../../context/CanvasContext";
import styles from "./LayersPanel.module.css";

const { Title } = Typography;
const { Sider } = Layout;

const LayerPanel = () => {
  const { layers, selectedLayerId, selectLayer, moveLayer } = useCanvas();

  return (
    <Sider theme="light" className={styles.container}>
      <Title level={4}>Layers</Title>
      <Divider />
      <List
        dataSource={layers}
        renderItem={(layer) => (
          <List.Item
            style={{
              background:
                layer.id === selectedLayerId ? "#e6f7ff" : "transparent",
            }}
            className={styles.listItem}
            onClick={() => selectLayer(layer.id)}
          >
            <span>
              {layer.type} (#{layer.zIndex})
            </span>
            <div className={styles.buttonContainer}>
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
