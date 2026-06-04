import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

const Wrap = <ProtectedRoute><Dashboard /></ProtectedRoute>;

const router = createBrowserRouter([
  { path: "/",                       element: <Navigate to="/login" replace /> },
  { path: "/login",                   element: <Login /> },
  { path: "/dashboard",               element: Wrap },
  { path: "/dashboard/:page",         element: Wrap },
  { path: "/dashboard/:page/:id",     element: Wrap },
]);

export default router;
