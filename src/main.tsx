import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { UploadImages } from "./pages/UploadImages";
import LoginPage from "./pages/auth/LoginPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/uploadimage" element={< UploadImages />} />
        <Route path="/login" element={<LoginPage />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
