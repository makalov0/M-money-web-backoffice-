import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "172.28.12.205",
  user: process.env.DB_USER || "Souksan",
  password: process.env.DB_PASSWORD || "Lmm@A2025!",
  database: process.env.DB_NAME || "WebApp",
  port: Number(process.env.DB_PORT || 5432),

  // Increase timeouts and add retry logic
  connectionTimeoutMillis: 30000,  // 30s
  idleTimeoutMillis: 30000,        // 30s
  query_timeout: 30000,            // 30s

  // Connection pool settings
  max: 20,                         // Maximum connections
  min: 2,                          // Minimum connections

  // Helps with firewall/NAT resets
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,

  // Retry on connection errors
  retryOnExit: true,
});

pool.on("error", (err) => {
  console.error("❌ PG Pool error:", err);
  // Don't exit process, let the pool handle reconnection
});

pool.on("connect", (client) => {
  console.log("✅ New client connected to database");
});

pool.on("remove", (client) => {
  console.log("🔌 Client removed from pool");
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log("✅ Database connection successful");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
};

export default pool;
