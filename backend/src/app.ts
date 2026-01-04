import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import webhookRoutes from "./routes/webhook.routes";

dotenv.config();
const app = express();

// 🎯 STEP 1: Webhook MUST be FIRST
app.use("/api/webhooks", webhookRoutes);

// 🎯 STEP 2: CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 🎯 STEP 3: JSON parsing middleware (بعد الـ webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎯 STEP 4: Health check
app.get("/", (_req, res) => {
  res.json({
    message: "Taskaya API is running",
    version: "4.0.0",
  });
});

// 🎯 STEP 5: باقي الـ routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 🎯 STEP 6: Error handlers
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
