// backend/src/routes/task.routes.ts - FIXED: Dual Auth Support
import { Router } from "express";
import { dualAuth, extractUser } from "../middleware/dual-auth.middleware";
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

// ============================================
// DUAL AUTHENTICATION (Clerk + JWT)
// ============================================
// All task routes now support BOTH authentication methods
router.use(dualAuth);
router.use(extractUser);

// ============================================
// TASK ROUTES
// ============================================

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