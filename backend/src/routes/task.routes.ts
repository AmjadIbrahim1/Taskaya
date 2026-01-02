// backend/src/routes/task.routes.ts - ENHANCED
import { Router } from "express";
import { clerkAuth, extractClerkUser } from "../middleware/clerk.middleware";
import { jwtAuth } from "../middleware/jwt.middleware";
import {
  createTaskValidator,
  updateTaskValidator,
  deleteTaskValidator,
  searchTasksValidator,
} from "../middleware/validation.middleware";
import {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  getCompletedTasks,
  getUrgentTasks,
  searchTasks,
} from "../controllers/task.controller";

const router = Router();

/**
 * Smart Authentication Middleware
 * Automatically detects whether the token is from Clerk or JWT
 * and applies the appropriate authentication middleware
 */
const smartAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authentication token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format" });
  }

  try {
    // Decode token WITHOUT verification to check its structure
    const parts = token.split(".");
    if (parts.length !== 3) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded: any = JSON.parse(Buffer.from(parts[1], "base64").toString());

    // Clerk tokens have specific fields: 'azp', 'sid', 'sub'
    // JWT tokens have: 'id', 'email', 'iat', 'exp'
    const isClerkToken = !!(
      decoded.azp ||
      decoded.sid ||
      (decoded.sub && !decoded.id)
    );
    const isJWTToken = !!(decoded.id && decoded.email);

    if (isClerkToken) {
      console.log("🔵 Detected Clerk token - applying Clerk auth");
      return clerkAuth(req, res, (err?: any) => {
        if (err) return next(err);
        return extractClerkUser(req, res, next);
      });
    } else if (isJWTToken) {
      console.log("🟢 Detected JWT token - applying JWT auth");
      return jwtAuth(req, res, next);
    } else {
      console.log("❌ Unknown token format");
      return res.status(401).json({ error: "Unrecognized token format" });
    }
  } catch (error) {
    console.error("❌ Token parsing error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Apply smart auth to all routes
router.use(smartAuth);

// ============= TASK ROUTES =============

// Get all tasks
router.get("/", getTasks);

// Create new task
router.post("/", createTaskValidator, addTask);

// Get completed tasks ONLY
router.get("/completed", getCompletedTasks);

// Get ALL urgent tasks (completed and incomplete)
router.get("/urgent", getUrgentTasks);

// Search tasks
router.get("/search", searchTasksValidator, searchTasks);

// Update task
router.put("/:id", updateTaskValidator, updateTask);

// Delete task
router.delete("/:id", deleteTaskValidator, deleteTask);

export default router;
