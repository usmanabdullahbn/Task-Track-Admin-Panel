import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem("User");

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
