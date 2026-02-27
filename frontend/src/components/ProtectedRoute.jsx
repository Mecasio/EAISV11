import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("person_id");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("department");
};

export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return false;

    const payload = JSON.parse(atob(payloadBase64));
    if (!payload?.exp) return false;

    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    const normalizedAllowedRoles = Array.isArray(allowedRoles)
      ? allowedRoles
      : allowedRoles
        ? [allowedRoles]
        : [];

    if (!storedEmail || !isTokenValid(token)) {
      clearAuthStorage();
      setIsAuthorized(false);
      return;
    }

    if (normalizedAllowedRoles.length === 0 || normalizedAllowedRoles.includes(storedRole)) {
      setIsAuthorized(true);
      return;
    }

    setIsAuthorized("unauthorized");
  }, [allowedRoles]);

  if (isAuthorized === null) return <div>Loading...</div>;
  if (isAuthorized === true) return children;
  if (isAuthorized === "unauthorized") return <Navigate to="/unauthorized" />;

  return <Navigate to="/" />;
};

export default ProtectedRoute;
