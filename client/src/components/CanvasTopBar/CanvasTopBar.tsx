import { useState, useEffect } from "react";
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
  DownloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useCanvas } from "../../context/CanvasContext";
import { getBase64 } from "../../helpers/imageUploadHelpers";
import styles from "./CanvasTopBar.module.css";

const { Header } = Layout;

const Navbar = () => {
  const {
    addRectangle,
    addCircle,
    addText,
    addImage,
    updateCanvasHeight,
    updateCanvasWidth,
    undo,
    redo,
    isHistoryEmpty,
    isRedoEmpty,
    downloadCanvasAsImage,
    saveCanvas,
  } = useCanvas();

  const [loading, setLoading] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });

  useEffect(() => {
    updateCanvasWidth(canvasSize.width);
    updateCanvasHeight(canvasSize.height);
  }, [canvasSize, updateCanvasWidth, updateCanvasHeight]);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    setLoading(true);
    try {
      const url = await getBase64(file as File);
      addImage(url);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const renderToolButton = (
    title: string,
    icon: React.ReactNode,
    onClick: () => void,
    options: {
      disabled?: boolean;
      shape?: "circle" | "default";
      loading?: boolean;
    } = {}
  ) => (
    <Tooltip title={title} placement="bottom">
      <Button
        shape={options.shape ?? "circle"}
        icon={icon}
        onClick={onClick}
        disabled={options.disabled}
        loading={options.loading}
      />
    </Tooltip>
  );

  return (
    <Header className={styles.container}>
      <div className={styles.projectTitle}>My Project</div>
      <div className={styles.toolsContainer}>
        {renderToolButton("Add Circle", "○", addCircle)}
        {renderToolButton("Add Rectangle", "▭", addRectangle)}
        {renderToolButton("Add Text", <FontSizeOutlined />, addText)}

        <Upload showUploadList={false} beforeUpload={beforeUpload}>
          {renderToolButton("Upload Image", <PictureOutlined />, () => {}, {
            loading,
          })}
        </Upload>

        {renderToolButton("Undo", <UndoOutlined />, undo, {
          disabled: isHistoryEmpty,
        })}
        {renderToolButton("Redo", <RedoOutlined />, redo, {
          disabled: isRedoEmpty,
        })}

        {renderToolButton(
          "Download",
          <DownloadOutlined />,
          downloadCanvasAsImage,
          { shape: "default" }
        )}
        {renderToolButton("Save", <SaveOutlined />, saveCanvas, {
          shape: "default",
        })}
      </div>

      <div className={styles.canvasSizeContainer}>
        <span>Width</span>
        <InputNumber
          min={100}
          max={2000}
          value={canvasSize.width}
          onChange={(val) =>
            setCanvasSize((prev) => ({ ...prev, width: val ?? prev.width }))
          }
        />
        <span>Height</span>
        <InputNumber
          min={100}
          max={2000}
          value={canvasSize.height}
          onChange={(val) =>
            setCanvasSize((prev) => ({ ...prev, height: val ?? prev.height }))
          }
        />
      </div>
    </Header>
  );
};

export default Navbar;
