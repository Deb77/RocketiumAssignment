import { useState, useEffect } from "react";
import { Input, Slider, Typography, Divider, Layout } from "antd";
import type { Circle, Textbox } from "fabric";
import { useCanvas } from "../../context/CanvasContext";
import styles from "./PropertiesPanel.module.css";

const { Title } = Typography;
const { Sider } = Layout;

const CanvasPropertiesPanel = () => {
  const { selectedObject, updateProperty, version } = useCanvas();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [radius, setRadius] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [fillColor, setFillColor] = useState("#000000");

  useEffect(() => {
    if (!selectedObject) return;

    setFillColor((selectedObject.get("fill") as string) || "#000000");

    switch (selectedObject.type) {
      case "rect":
      case "image":
        setWidth((selectedObject.width ?? 0) * (selectedObject.scaleX ?? 1));
        setHeight((selectedObject.height ?? 0) * (selectedObject.scaleY ?? 1));
        break;
      case "circle":
        setRadius(
          (selectedObject as Circle).radius * (selectedObject.scaleX ?? 1)
        );
        break;
      case "textbox":
        setFontSize((selectedObject as Textbox).fontSize || 16);
        break;
    }
  }, [selectedObject, version]);

  const commonColorInput = (
    <>
      <Title level={5}>Fill Color</Title>
      <Input
        type="color"
        value={fillColor}
        onChange={(e) => {
          setFillColor(e.target.value);
          updateProperty("fill", e.target.value);
        }}
      />
    </>
  );

  const commonSizeSliders =
    selectedObject?.type === "rect" || selectedObject?.type === "image" ? (
      <>
        <Title level={5}>Width</Title>
        <Slider
          min={20}
          max={800}
          value={width}
          onChange={(val) => {
            setWidth(val);
            updateProperty("scaleX", val / (selectedObject.width ?? 1));
          }}
        />
        <Title level={5}>Height</Title>
        <Slider
          min={20}
          max={800}
          value={height}
          onChange={(val) => {
            setHeight(val);
            updateProperty("scaleY", val / (selectedObject.height ?? 1));
          }}
        />
      </>
    ) : null;

  return (
    <Sider
      theme="light"
      width={260}
      style={{
        right: selectedObject ? 0 : -260,
      }}
      className={styles.container}
    >
      <Title level={4}>Properties</Title>
      <Divider />

      {selectedObject?.type === "circle" && (
        <>
          <Title level={5}>Radius</Title>
          <Slider
            min={5}
            max={500}
            value={radius}
            onChange={(val) => {
              setRadius(val);
              updateProperty("radius", val);
            }}
          />
          {commonColorInput}
        </>
      )}

      {(selectedObject?.type === "rect" ||
        selectedObject?.type === "image") && (
        <>
          {commonSizeSliders}
          {selectedObject.type === "rect" && commonColorInput}
        </>
      )}

      {selectedObject?.type === "textbox" && (
        <>
          <Title level={5}>Font Size</Title>
          <Slider
            min={8}
            max={72}
            value={fontSize}
            onChange={(val) => {
              setFontSize(val);
              updateProperty("fontSize", val);
            }}
          />
          {commonColorInput}
        </>
      )}
    </Sider>
  );
};

export default CanvasPropertiesPanel;
