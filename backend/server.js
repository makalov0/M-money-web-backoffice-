// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

// DB
import { testConnection } from "./config/dbConnect.js";

// routes
import packageRoutes from "./routes/packageRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import hotNewsRoutes from "./routes/hotNewsRoutes.js";
import authRoute from "./routes/authRoute.js";
import auditRoutes from "./routes/auditRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import externalmenuRoutes from "./routes/externalmenuRoutes.js";
import submenuRoutes from "./routes/submenuRoutes.js";
import reportRoutes from "./routes/reportroutes.js";

// ✅ if you create external proxy routes, import like this (optional)
// import externalMenuRoutes from "./routes/externalMenuRoutes.js";

// middleware
import authUser from "./middleware/authUser.js";

// socket
import initChatSocket from "./socket/chatSocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

/* ================================
   Ensure uploads directory
================================ */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* ================================
   Security & Performance
================================ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

/* ================================
   ✅ CORS helper (localhost + private LAN)
   Allows:
   - localhost/127.0.0.1
   - 172.16 - 172.31 (includes 172.28.x.x)
   - 10.x.x.x
   - 192.168.x.x
================================ */
const allowOrigin = (origin) => {
  // allow Postman / curl / server-to-server
  if (!origin) return true;

  const isLocalhost =
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

  // ✅ 172.16.0.0 - 172.31.255.255
  const isLan172 =
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:\d+$/.test(origin);

  const isLan10 = /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin);
  const isLan192 = /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin);

  return (
    isLocalhost ||
    isLan172 ||
    isLan10 ||
    isLan192 ||
    process.env.NODE_ENV === "development"
  );
};

/* ================================
   ✅ CORS (API)
================================ */
const corsOptions = {
  origin: (origin, callback) => {
    if (allowOrigin(origin)) return callback(null, true);

    console.log("❌ CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ================================
   Body parsers
================================ */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================================
   Static uploads
================================ */
app.use("/uploads", express.static(uploadsDir));
app.use("/chatimage", express.static(path.join(process.cwd(), "chatimage")));

/* ================================
   Attach req.user if token exists
================================ */
app.use(authUser);

/* ================================
   Health check
================================ */
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = (await testConnection()) ? "connected" : "disconnected";
    res.json({
      status: "ok",
      message: "Backend is running",
      port: PORT,
      database: dbStatus,
      time: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

/* ================================
   Routes
================================ */
app.use("/api/packages", packageRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/hot-news", hotNewsRoutes);
app.use("/api/auth", authRoute);
app.use("/api/audit", auditRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/submenus", submenuRoutes);
app.use("/api/externalmenu", externalmenuRoutes);
app.use("/api/reports", reportRoutes);

// ✅ if you add external proxy routes
// app.use("/api/external-menus", externalMenuRoutes);

/* ================================
   Root
================================ */
app.get("/", (req, res) => {
  res.json({
    message: "M-Money API Server",
    api: "/api",
    socket: "enabled",
  });
});

/* ================================
   404
================================ */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

/* ================================
   Error handler
================================ */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

/* ================================
   HTTP + Socket.IO
================================ */
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (allowOrigin(origin)) return callback(null, true);

      console.log("❌ Socket CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

// init chat socket
initChatSocket(io);

/* ================================
   Start server
================================ */
const startServer = async () => {
  try {
    console.log("🔍 Checking database...");
    await testConnection();

    // ✅ Important: allow other computers in LAN
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Backend running`);
      console.log(`📡 API    : http://0.0.0.0:${PORT}/api`);
      console.log(`💬 Socket : http://0.0.0.0:${PORT}`);
      console.log(`🖼️ Uploads: http://0.0.0.0:${PORT}/uploads`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
};

startServer();
