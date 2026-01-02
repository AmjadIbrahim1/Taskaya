// src/middleware/dual-auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface DualAuthRequest extends Request {
  userId?: number;
  clerkUserId?: string;
  authMethod?: "jwt" | "clerk";
}

interface JwtPayload {
  id: number;
  email: string;
}

/**
 * Middleware that supports both JWT and Clerk authentication
 * Priority: Clerk > JWT
 */
export const dualAuth = async (
  req: DualAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    // Try Clerk authentication first
    try {
      const clerkSession = await clerkClient.verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (clerkSession && clerkSession.sub) {
        console.log("✅ Clerk authentication successful");
        const clerkUserId = clerkSession.sub;
        req.clerkUserId = clerkUserId;
        req.authMethod = "clerk";

        // Get or create user in database
        let user = await prisma.user.findUnique({
          where: { clerkId: clerkUserId },
          select: { id: true, email: true, clerkId: true },
        });

        if (!user) {
          console.log("📝 Creating new user from Clerk...");
          const clerkUser = await clerkClient.users.getUser(clerkUserId);

          const primaryEmail = clerkUser.emailAddresses.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          );

          if (!primaryEmail) {
            res.status(400).json({ error: "No email address found" });
            return;
          }

          user = await prisma.user.create({
            data: {
              clerkId: clerkUserId,
              email: primaryEmail.emailAddress,
              name: clerkUser.firstName
                ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
                : null,
              imageUrl: clerkUser.imageUrl,
            },
            select: { id: true, email: true, clerkId: true },
          });

          console.log("✅ User created:", user.email);
        }

        req.userId = user.id;
        return next();
      }
    } catch (clerkError) {
      console.log("⚠️ Clerk auth failed, trying JWT...");
    }

    // Fallback to JWT authentication
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log("✅ JWT authentication successful");
      req.userId = decoded.id;
      req.authMethod = "jwt";
      return next();
    } catch (jwtError) {
      console.error("❌ JWT auth failed:", jwtError);
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};