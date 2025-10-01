import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import { CanvasProvider } from "./context/CanvasContext";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EditorPage from "./pages/EditorPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<HomePage />} />
        {/* Canvas Editor page */}
        <Route
          path="/editor"
          element={
            <CanvasProvider>
              <EditorPage />
            </CanvasProvider>
          }
        />
        {/* About page */}
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
