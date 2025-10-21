import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import About from "./pages/About";
import { UploadImages } from "./pages/UploadImages";
import Login from "./pages/auth/LoginPage";
import MainPage from "./pages/mainscreen";
import CalculateSalary from "./pages/CalculateSalary";
import CheckLoaner from "./pages/CheckXjaidee";
import UpdateXjaidee from "./pages/UpdateXjaidee";
import AmountAll from "./pages/Amount";
import ReportSalary from "./pages/Reportsalary";
import Permission from "./pages/auth/Permission";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
        
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/checkxjaidee"
          element={
            <Permission allowedRoles={["admin", "user"]}>
              <CheckLoaner />
            </Permission>
          }
        />
        <Route
          path="/calculatesalary"
          element={
            <Permission allowedRoles={["admin", "user"]}>
              <CalculateSalary />
            </Permission>
          }
        />
        <Route
          path="/updatexjaidee"
          element={
            <Permission allowedRoles={["admin", "user"]}>
              <UpdateXjaidee />
            </Permission>
          }
        />
        <Route
          path="/amount_all"
          element={
            <Permission allowedRoles={["admin", "manager"]}>
              <AmountAll />
            </Permission>
          }
        />
        <Route
          path="/reportsalary"
          element={
            <Permission allowedRoles={["admin", "manager"]}>
              <ReportSalary />
            </Permission>
          }
        />
        <Route path="/uploadimage" element={<UploadImages />} />
        <Route path="/mainscreen" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);