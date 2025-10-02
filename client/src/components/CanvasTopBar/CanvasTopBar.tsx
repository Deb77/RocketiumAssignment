import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Button,
  Upload,
  Tooltip,
  InputNumber,
  type UploadProps,
  Modal,
  Input,
  message,
} from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  PictureOutlined,
  FontSizeOutlined,
  DownloadOutlined,
  SaveOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useCanvasActions } from "../../context/CanvasContexts";
import { getBase64 } from "../../helpers/imageUploadHelpers";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCanvasHeight, setCanvasWidth } from "../../store/uiSlice";
import api from "../../api";
import styles from "./CanvasTopBar.module.css";

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
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const canvasId = params.get("canvasId");

  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

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

  const openShare = () => setShareOpen(true);
  const closeShare = () => {
    setShareOpen(false);
    setShareEmail("");
  };

  const submitShare = async () => {
    if (!canvasId) {
      message.error("No canvas selected");
      return;
    }
    if (!shareEmail.trim()) {
      message.error("Enter an email to share with");
      return;
    }
    try {
      await api.post(`/canvas/${canvasId}/share-email`, {
        email: shareEmail.trim(),
      });
      message.success("Collaborator added");
      closeShare();
    } catch (e: any) {
      message.error(e.response?.data?.error || e.message || "Failed to share");
    }
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
      <div className={styles.projectTitle}>
        <Button onClick={goBack} style={{ marginRight: 8 }} icon={<ArrowLeftOutlined />}>
        </Button>
        My Project
      </div>
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
        {renderToolButton("Share", <ShareAltOutlined />, openShare, {
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

      <Modal
        title="Share canvas by email"
        open={shareOpen}
        onOk={submitShare}
        onCancel={closeShare}
        okText="Share"
        okButtonProps={{ disabled: !shareEmail.trim() }}
      >
        <Input
          placeholder="collaborator@example.com"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          onPressEnter={submitShare}
        />
      </Modal>
    </Header>
  );
};

export default CanvasTopBar;
