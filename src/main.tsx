import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Login from "./pages/auth/LoginPage";
import MainPage from "./pages/mainscreen";
import DataPackages from "./pages/data-packages";
import MobileTopup from "./pages/mobile-topup";
import CustomerChat from ".//pages/customer-chat";
import Permission from "./pages/auth/Permission";
import PromotionsManagement from "./pages/promotions";
import UpdateBanner from "./pages/update-banner";
import ESIMService from "./pages/esim-service";
import RoamingCustomer from "./pages/data-roaming";
import FTTHServices from "./pages/ftth/services";
import TicketManagement from "./pages/digital-entertainment/ticket";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/mainscreen" element={<MainPage />} />
        
        {/* Data Packages */}
        <Route
          path="/data-packages"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <DataPackages />
            </Permission>
          }
        />
        
        {/* Mobile Top-up */}
        <Route
          path="/mobile-topup"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <MobileTopup />
            </Permission>
          }
        />
        
        {/* Promotions Management */}
        <Route
          path="/promotions"
          element={
            <Permission allowedRoles={["admin", "manager"]}>
              <PromotionsManagement />
            </Permission>
          }
        />
        
        {/* Update Banner */}
        <Route
          path="/update-banner"
          element={
            <Permission allowedRoles={["admin", "manager"]}>
              <UpdateBanner />
            </Permission>
          }
        />
        
        {/* eSIM Service */}
        <Route
          path="/esim-service"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <ESIMService />
            </Permission>
          }
        />
        
        {/* Data Roaming */}
        <Route
          path="/data-roaming"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <RoamingCustomer />
            </Permission>
          }
        />
        
        {/* FTTH Services */}
        <Route
          path="/ftth/services"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <FTTHServices />
            </Permission>
          }
        />
        
        {/* Ticket Management */}
        <Route
          path="/digital-entertainment/ticket"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <TicketManagement />
            </Permission>
          }
        />
        
        {/* Customer Chat */}
        <Route
          path="/customer-chat"
          element={
            <Permission allowedRoles={["admin", "manager", "user"]}>
              <CustomerChat />
            </Permission>
          }
        />
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);