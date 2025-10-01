import {
  Layout,
  Button,
  Upload,
  Tooltip,
  InputNumber,
  type UploadProps,
} from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  PictureOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { useCanvas } from "../context/CanvasContext";
import { useState, useEffect } from "react";

const { Header } = Layout;

const Navbar = () => {
  const {
    addRectangle,
    addCircle,
    addText,
    addImage,
    updateCanvasHeight,
    updateCanvasWidth,
  } = useCanvas();
  const [loading, setLoading] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState<number | null>(500);
  const [canvasHeight, setCanvasHeight] = useState<number | null>(500);

  useEffect(() => {
    updateCanvasWidth(canvasWidth);
  }, [canvasWidth]);

  useEffect(() => {
    updateCanvasHeight(canvasHeight);
  }, [canvasHeight]);

  const getBase64 = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(file);
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    setLoading(true);
    getBase64(file as File, (url) => {
      setLoading(false);
      addImage(url);
    });
    return false; // prevent actual upload
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* Project Name */}
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>My Project</div>

      {/* Tools */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Tooltip title="Add Circle" placement="bottom">
          <Button shape="circle" onClick={addCircle}>
            ○
          </Button>
        </Tooltip>

        <Tooltip title="Add Rectangle" placement="bottom">
          <Button shape="circle" onClick={addRectangle}>
            ▭
          </Button>
        </Tooltip>

        <Tooltip title="Add Text" placement="bottom">
          <Button icon={<FontSizeOutlined />} onClick={addText} />
        </Tooltip>

        <Tooltip title="Upload Image" placement="bottom">
          <Upload showUploadList={false} beforeUpload={beforeUpload}>
            <Button icon={<PictureOutlined />} loading={loading} />
          </Upload>
        </Tooltip>

        <Tooltip title="Undo" placement="bottom">
          <Button icon={<UndoOutlined />} />
        </Tooltip>

        <Tooltip title="Redo" placement="bottom">
          <Button icon={<RedoOutlined />} />
        </Tooltip>
      </div>

      {/* Canvas Size */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span>Width</span>
        <InputNumber
          min={100}
          max={2000}
          value={canvasWidth}
          onChange={(val) => setCanvasWidth(val)}
        />
        <span>Height</span>
        <InputNumber
          min={100}
          max={2000}
          value={canvasHeight}
          onChange={(val) => setCanvasHeight(val)}
        />
      </div>
    </Header>
  );
};

export default Navbar;
