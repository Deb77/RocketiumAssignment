import { Layout } from "antd";
import CanvasTopBar from "../components/CanvasTopBar/CanvasTopBar";
import LayersPanel from "../components/LayersPanel/LayersPanel";
import CanvasBoard from "../components/CanvasBoard/CanvasBoard";
import CanvasPropertiesPanel from "../components/PropertiesPanel/PropertiesPanel";
const { Content } = Layout;

const EditorPage = () => {
  return (
    <Layout>
      <CanvasTopBar />
      <Layout>
        <LayersPanel />
        <Content>
          <CanvasBoard />
        </Content>
        <CanvasPropertiesPanel />
      </Layout>
    </Layout>
  );
};

export default EditorPage;
