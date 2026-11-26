import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

// Security & Utility Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / server-to-server requests (no Origin header) or configured origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure MongoDB connection is established (serverless-safe cached connection)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Root welcome route
app.get("/", (req, res) => {
  res.json({
    name: "EventHub API Server",
    status: "running",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Mount modular API routes under /api
app.use("/api", apiRoutes);

// Catch 404s
app.use(notFoundHandler);

// Central error handling middleware
app.use(errorHandler);

// Start local HTTP listener only outside Vercel serverless runtime
if (!process.env.VERCEL) {
  const startServer = () => {
    const server = app.listen(PORT, () => {
      console.log(`[EventHub] Backend running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
      console.log(`[EventHub] Health Check: http://localhost:${PORT}/api/health`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ [EventHub Error] Port ${PORT} is already in use.`);
        if (PORT === 5000 || PORT === "5000") {
          console.error(
            `💡 [macOS Tip] Port 5000 is occupied by Apple's AirPlay Receiver (ControlCenter).\n` +
            `   - To free port 5000: System Settings > General > AirDrop & AirPlay > Turn off 'AirPlay Receiver'.\n` +
            `   - Or switch to port 5001: Set PORT=5001 in backend/.env and NEXT_PUBLIC_API_URL=http://localhost:5001/api in frontend/.env.local.\n`
          );
        }
      }
    });

    // Establish initial DB connection in background
    connectDB();
  };

  startServer();
}

export default app;
