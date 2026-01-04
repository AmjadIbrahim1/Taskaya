// backend/src/middleware/dual-auth.middleware.ts - CORRECT VERSION
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    orgId?: string;
  };
  userId?: number;
  clerkUserId?: string;
  userEmail?: string;
  userName?: string;
  authMethod?: "clerk" | "jwt";
}

interface JwtPayload {
  id: number;
  email: string;
}

/**
 * Simple Dual Authentication Middleware
 * Tries JWT first, then Clerk
 */
export const dualAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No authorization header");
      res.status(401).json({ error: "Unauthorized - No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ Invalid authorization format");
      res.status(401).json({ error: "Unauthorized - Invalid token format" });
      return;
    }

    // ============================================
    // STRATEGY 1: Try JWT Authentication
    // ============================================
    try {
      console.log("🔑 Attempting JWT authentication...");

      // ✅ CORRECT: Verify JWT with HS256 explicitly
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"], // ✅ Use HS256 explicitly
      }) as JwtPayload;

      console.log("✅ JWT decoded:", decoded);

      // Find JWT user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          clerkId: true,
          password: true,
        },
      });

      if (user && user.password) {
        // Valid JWT user
        console.log("✅ JWT authentication successful:", user.email);

        req.userId = user.id;
        req.userEmail = user.email;
        req.userName = user.name || undefined;
        req.authMethod = "jwt";

        next();
        return;
      }

      console.log("❌ JWT user not found or not a JWT user");
    } catch (jwtError: any) {
      console.log("❌ JWT verification failed:", jwtError.message);
    }

    // ============================================
    // STRATEGY 2: Try Clerk Authentication
    // ============================================
    try {
      console.log("🔵 Attempting Clerk authentication...");

      // Verify Clerk token with clock tolerance for time skew
      const sessionClaims = await clerkClient.verifyToken(token, {
        clockSkewInMs: 5 * 60 * 1000, // Allow 5 minutes clock skew
        jwtKey: process.env.CLERK_JWT_KEY,
      });

      if (!sessionClaims || !sessionClaims.sub) {
        throw new Error("Invalid Clerk token - no user ID");
      }

      const clerkUserId = sessionClaims.sub;
      console.log("🔵 Clerk User ID verified:", clerkUserId);

      // Find Clerk user in database
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          id: true,
          email: true,
          clerkId: true,
          name: true,
          imageUrl: true,
        },
      });

      if (!user) {
        console.error("❌ Clerk user not found in database:", clerkUserId);
        res.status(404).json({
          error: "User not found",
          hint: "Your Clerk account exists but not in our database. Please contact support.",
        });
        return;
      }

      console.log("✅ Clerk authentication successful:", user.email);

      // Attach user info to request
      req.userId = user.id;
      req.userEmail = user.email;
      req.userName = user.name || undefined;
      req.clerkUserId = clerkUserId;
      req.authMethod = "clerk";

      next();
      return;
    } catch (clerkError: any) {
      console.error("❌ Clerk verification failed:", clerkError.message);
    }

    // ============================================
    // Both methods failed
    // ============================================
    console.error("❌ Both JWT and Clerk authentication failed");
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token. Please login again.",
      hint: "Try logging out and logging back in",
    });
  } catch (error: any) {
    console.error("❌ Dual auth unexpected error:", error);
    res.status(500).json({
      error: "Authentication error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Extract user info (used after dualAuth)
 */
export const extractUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userId) {
    console.log("❌ No user ID found after auth");
    res.status(401).json({ error: "Unauthorized - User not authenticated" });
    return;
  }

  console.log(`✅ Authenticated via ${req.authMethod?.toUpperCase()}:`, {
    id: req.userId,
    email: req.userEmail,
  });

  next();
};
