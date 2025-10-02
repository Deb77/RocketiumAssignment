import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import { CanvasProvider } from "./context/CanvasProvider";
import { MessageProvider } from "./context/MessageContext";
import { store } from "./store";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Provider store={store}>
      <MessageProvider>
      <Router>
        <Routes>
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <CanvasProvider>
                  <EditorPage />
                </CanvasProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
      </MessageProvider>
    </Provider>
  );
}

export default App;
