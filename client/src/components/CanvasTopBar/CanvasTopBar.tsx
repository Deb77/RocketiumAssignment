import { useEffect, useState } from "react";
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
import { useCanvasActions } from "../../context/CanvasContext";
import { getBase64 } from "../../helpers/imageUploadHelpers";
import styles from "./CanvasTopBar.module.css";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCanvasHeight, setCanvasWidth } from "../../store/uiSlice";

const { Header } = Layout;

const CanvasTopBar = () => {
  const {
    addRectangle,
    addCircle,
    addText,
    addImage,
    undo,
    redo,
    downloadCanvasAsImage,
    saveCanvas,
  } = useCanvasActions();

  const dispatch = useAppDispatch();
  const { canvasWidth, canvasHeight, isHistoryEmpty, isRedoEmpty } =
    useAppSelector((state) => state.ui);

  const [loading, setLoading] = useState(false);

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
  useEffect(() => {
    console.log("redo");
  }, [redo]);

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
          value={canvasWidth}
          onChange={(val) => dispatch(setCanvasWidth(val ?? canvasWidth))}
        />
        <span>Height</span>
        <InputNumber
          value={canvasHeight}
          onChange={(val) => dispatch(setCanvasHeight(val ?? canvasHeight))}
        />
      </div>
    </Header>
  );
};

export default CanvasTopBar;
