import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import { CanvasProvider } from "./context/CanvasContext";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;
