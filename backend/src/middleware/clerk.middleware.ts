// backend/src/middleware/clerk.middleware.ts
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

    console.log("🔍 Processing Clerk User ID:", clerkUserId);

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true, clerkId: true, name: true, imageUrl: true },
    });

    // If user doesn't exist, create them from Clerk data
    if (!user) {
      console.log("📝 Creating new Clerk user in database...");

      // Get user info from Clerk
      const { clerkClient } = await import("@clerk/clerk-sdk-node");
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      );

      if (!primaryEmail) {
        res.status(400).json({ error: "No email address found in Clerk account" });
        return;
      }

      // Check if email already exists (from JWT user)
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: primaryEmail.emailAddress.toLowerCase() },
      });

      if (existingEmailUser) {
        res.status(409).json({ 
          error: "This email is already registered. Please sign in with email/password instead." 
        });
        return;
      }

      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: primaryEmail.emailAddress.toLowerCase(),
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null,
          imageUrl: clerkUser.imageUrl,
          password: null, // Clerk users don't have password
        },
        select: { id: true, email: true, clerkId: true, name: true, imageUrl: true },
      });

      console.log("✅ Clerk user created in database:", user.email);
    } else {
      console.log("✅ Clerk user found in database:", user.email);
    }

    // Attach database user ID to request
    req.userId = user.id;

    next();
  } catch (error) {
    console.error("❌ Extract Clerk user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};