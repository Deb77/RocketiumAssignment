import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store";

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
