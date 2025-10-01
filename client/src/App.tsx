import "./App.css";
import CanvasBoard from "./components/CanvasBoard";
import CanvasTopBar from "./components/CanvasTopBar";
import { CanvasProvider } from "./context/CanvasContext";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import CanvasPropertiesPanel from "./components/PropertiesPanel";
import LayersPanel from "./components/LayersPanel";

function App() {
  return (
    <CanvasProvider>
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
    </CanvasProvider>
  );
}

export default App;
