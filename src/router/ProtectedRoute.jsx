import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const doctorId = localStorage.getItem("doctorId");
  return doctorId ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
