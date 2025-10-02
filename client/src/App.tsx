import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import { CanvasProvider } from "./context/CanvasProvider";
import { store } from "./store";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";

function App() {

  console.log("API Base URL:", import.meta.env.VITE_SERVER_URL);
  return (
    <Provider store={store}>
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
          <Route path="/login" element={<LoginPage />} />
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
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
