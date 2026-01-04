// backend/src/middleware/clerk.middleware.ts - ENHANCED
import { Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { prisma } from "../config/db";

export interface ClerkRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    orgId?: string;
  };
  userId?: number;
  clerkUserId?: string;
  userEmail?: string;
  userName?: string;
}

// Clerk authentication middleware
export const clerkAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error("❌ Clerk authentication error:", error);
    return {
      status: 401,
      message: "Unauthorized - Invalid or missing Clerk token",
    };
  },
});

// Middleware to sync Clerk user with database
export const extractClerkUser = async (
  req: ClerkRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.auth || !req.auth.userId) {
      res.status(401).json({ error: "Unauthorized - No Clerk user ID found" });
      return;
    }

    const clerkUserId = req.auth.userId;
    req.clerkUserId = clerkUserId;

    console.log("🔵 Processing Clerk User ID:", clerkUserId);

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { 
        id: true, 
        email: true, 
        clerkId: true, 
        name: true, 
        imageUrl: true 
      },
    });

    // If user doesn't exist, they should have been created via webhook
    if (!user) {
      console.error("❌ User not found - should be created via webhook first");
      res.status(404).json({ 
        error: "User account not found",
        hint: "Please ensure your Clerk account is fully set up. If this persists, contact support.",
        clerkId: clerkUserId
      });
      return;
    }

    console.log("✅ Clerk user found in database:", user.email);

    // Attach database user info to request
    req.userId = user.id;
    req.userEmail = user.email;
    req.userName = user.name || undefined;

    console.log("🎯 Request authenticated - User ID:", req.userId);

    next();
  } catch (error) {
    console.error("❌ Extract Clerk user error:", error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: "Authentication failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};