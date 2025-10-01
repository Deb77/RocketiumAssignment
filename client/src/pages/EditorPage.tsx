import CanvasTopBar from "../components/CanvasTopBar";
import LayersPanel from "../components/LayersPanel";
import CanvasBoard from "../components/CanvasBoard";
import CanvasPropertiesPanel from "../components/PropertiesPanel";
import { Layout } from "antd";
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
