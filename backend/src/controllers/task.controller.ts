// src/controllers/task.controller.ts - ENHANCED
import { Response } from "express";
import { prisma } from "../config/db";
import { ClerkRequest } from "../middleware/clerk.middleware";

// Add a new task
export const addTask = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("========= ADD TASK DEBUG =========");
    console.log("1. Request Body:", req.body);
    console.log("2. User ID (Database):", req.userId);
    console.log("3. Clerk User ID:", req.clerkUserId);

    const { title, description, deadline, is_urgent } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      console.log("❌ Error: Title is missing or invalid");
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (!req.userId) {
      console.log("❌ Error: User ID is missing");
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    console.log("4. Creating task with data:", {
      userId: req.userId,
      title: title.trim(),
      description: description?.trim() || null,
      deadline: deadline ? new Date(deadline) : null,
      isUrgent: is_urgent || false,
      status: "pending",
    });

    const task = await prisma.task.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        isUrgent: is_urgent || false,
        status: "pending",
      },
    });

    console.log("✅ Task created successfully:", task);
    console.log("==================================");

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("========= ADD TASK ERROR =========");
    console.error("Error details:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    console.error("==================================");

    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get all tasks for user
export const getTasks = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("========= GET TASKS DEBUG =========");
    console.log("User ID:", req.userId);

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [
        { completed: "asc" },
        { isUrgent: "desc" },
        { createdAt: "desc" },
      ],
    });

    console.log("✅ Tasks found:", tasks.length);
    console.log("==================================");

    res.json({ tasks, count: tasks.length });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a task
export const updateTask = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, deadline, is_urgent, completed, status } =
      req.body;

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (isNaN(parseInt(id))) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
        ...(is_urgent !== undefined && { isUrgent: is_urgent }),
        ...(completed !== undefined && { completed }),
        ...(status !== undefined && { status }),
      },
    });

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a task
export const deleteTask = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (isNaN(parseInt(id))) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get completed tasks - FIXED: Only return completed tasks
export const getCompletedTasks = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("✅ Fetching ONLY completed tasks");

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        completed: true, // FIXED: Only completed tasks
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log("✅ Completed tasks found:", tasks.length);
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    console.error("Get completed tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get urgent tasks - FIXED: Return ALL urgent tasks (completed and incomplete)
export const getUrgentTasks = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("🔥 Fetching ALL urgent tasks");

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        isUrgent: true, // FIXED: All urgent, regardless of completion
      },
      orderBy: [
        { completed: "asc" }, // Incomplete first
        { createdAt: "desc" },
      ],
    });

    console.log("✅ Urgent tasks found:", tasks.length);
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    console.error("Get urgent tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search tasks
export const searchTasks = async (
  req: ClerkRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!q || typeof q !== "string" || !q.trim()) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        OR: [
          { title: { contains: q.trim(), mode: "insensitive" } },
          { description: { contains: q.trim(), mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ tasks, count: tasks.length, query: q.trim() });
  } catch (error) {
    console.error("Search tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
