import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Login from "./pages/auth/LoginPage";
import MainPage from "./pages/mainscreen";
import DataPackages from "./pages/data-packages";
import MobileTopup from "./pages/mobile-topup";

import PromotionsManagement from "./pages/promotions";
import UpdateBanner from "./pages/update-banner";
import ESIMService from "./pages/esim-service";
import RoamingCustomer from "./pages/data-roaming";
import FTTHServices from "./pages/ftth/services";
import TicketManagement from "./pages/digital-entertainment/ticket";
import FTTHPayment from "./pages/ftth/payment";
import FailedPayments from "./pages/ftth/failed-payment";
import FTTHReservation from "./pages/ftth/reservation";
import ElectricityBillPayment from "./pages/bill/electricity";
import HotNewsUpdate from "./pages/update-news";
import RealtimeMonitor from "./pages/admin/RealtimeMonitor";
import AdminChat from "./pages/AdminChat";
import Permission from "./pages/auth/Permission";
import { ProtectedRoute, LoginGate, isAuthenticated } from "./components/AuthRoutes";
import MenusPage from "./pages/MenusPage";
import Report from "./pages/report";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? "/mainscreen" : "/login"} replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <LoginGate>
              <Login />
            </LoginGate>
          }
        />

        {/* Pages (layout handled inside page) */}
        <Route path="/mainscreen" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />

        <Route path="/data-packages" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <DataPackages />
            </Permission>
          </ProtectedRoute>
        } />
        <Route path="/reports/log-web-mmoney" element={
            <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
             <Report />
            </Permission>
           </ProtectedRoute>
        }/>

        <Route path="/mobile-topup" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <MobileTopup />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/promotions" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <PromotionsManagement />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/update-banner" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <UpdateBanner />
            </Permission>
          </ProtectedRoute>
        } />
        <Route path="/MenusPage" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN"]}>
              <MenusPage />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/update-news" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <HotNewsUpdate />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/esim-service" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <ESIMService />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/data-roaming" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <RoamingCustomer />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/ftth/services" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <FTTHServices />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/ftth/payment" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <FTTHPayment />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/ftth/failed-payment" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <FailedPayments />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/ftth/reservation" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <FTTHReservation />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/digital-entertainment/ticket" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <TicketManagement />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/AdminChat" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <AdminChat />
            </Permission>
          </ProtectedRoute>
        } />

        <Route path="/bill/electricity" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN", "EMPLOYEE"]}>
              <ElectricityBillPayment />
            </Permission>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/RealtimeMonitor" element={
          <ProtectedRoute>
            <Permission allowedRoles={["ADMIN"]}>
              <RealtimeMonitor />
            </Permission>
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
