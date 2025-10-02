import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import { CanvasProvider } from "./context/CanvasContext";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/editor"
          element={
            <CanvasProvider>
              <EditorPage />
            </CanvasProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
