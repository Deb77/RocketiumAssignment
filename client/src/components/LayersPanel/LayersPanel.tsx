import {
  List,
  Button,
  Typography,
  Divider,
  Layout,
  Input,
} from "antd";
import {
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useState, useCallback } from "react";
import { useCanvasActions, useCanvasState } from "../../context/CanvasContexts";
import styles from "./LayersPanel.module.css";
import { useMessage } from "../../context/MessageContext";

const { Title } = Typography;
const { Sider } = Layout;

const LayerPanel = () => {
  const { layers, selectedLayerId } = useCanvasState();
  const { selectLayer, moveLayer, renameLayer, deleteLayer } =
    useCanvasActions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const { success } = useMessage();

  const startEditing = useCallback((currentName: string, layerId?: string) => {
    if (!layerId) return;
    setEditingId(layerId);
    setTempName(currentName);
  }, []);

  const saveName = () => {
    renameLayer(editingId, tempName);
    setEditingId(null);
    setTempName("");
    success("Layer name updated!");
  }

  return (
    <Sider theme="light" className={styles.container} width={250}>
      <Title level={4}>Layers</Title>
      <Divider />
      <List
        dataSource={layers}
        renderItem={(layer) => {
          const isEditing = layer.id === editingId;
          return (
            <List.Item
              style={{
                background:
                  layer.id === selectedLayerId ? "#e6f7ff" : "transparent",
              }}
              className={styles.listItem}
              onClick={() => selectLayer(layer.id)}
            >
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                {isEditing ? (
                  <Input
                    value={tempName}
                    size="small"
                    onChange={(e) => setTempName(e.target.value)}
                    onPressEnter={saveName}
                    onBlur={saveName}
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <span style={{ flex: 1 }}>
                    {layer.name || layer.type} (#{layer.zIndex})
                  </span>
                )}
              </div>
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
                {isEditing ? (
                  <Button
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={saveName}
                  />
                ) : (
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() =>
                      startEditing(layer.name || layer.type, layer.id)
                    }
                  />
                )}
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => deleteLayer(layer?.id)}
                />
              </div>
            </List.Item>
          );
        }}
      />
    </Sider>
  );
};

export default LayerPanel;
