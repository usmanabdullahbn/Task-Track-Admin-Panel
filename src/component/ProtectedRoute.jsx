import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("User"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role not allowed, redirect to a safe page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
