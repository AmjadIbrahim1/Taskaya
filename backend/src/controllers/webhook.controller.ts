// backend/src/controllers/webhook.controller.ts - ENHANCED CLERK WEBHOOK HANDLER
import { Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "../config/db";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.warn("⚠️  WARNING: CLERK_WEBHOOK_SECRET is not set!");
}

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      id: string;
      email_address: string;
    }>;
    primary_email_address_id?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    deleted?: boolean;
  };
}

export const handleClerkWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get headers for signature verification
    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing Svix headers");
      res.status(400).json({ error: "Missing Svix headers" });
      return;
    }

    // ✅ ENHANCED: Safe body parsing (handles Buffer and Object cases)
    const body = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    console.log(
      "📦 Body type:",
      Buffer.isBuffer(req.body) ? "Buffer" : "Object"
    );

    // Verify webhook signature
    if (!WEBHOOK_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET not configured");
      res.status(500).json({ error: "Webhook secret not configured" });
      return;
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let event: ClerkWebhookEvent;

    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    console.log("📨 Webhook Event Received:", event.type);

    // Handle different event types
    switch (event.type) {
      case "user.created":
        await handleUserCreated(event);
        break;

      case "user.updated":
        await handleUserUpdated(event);
        break;

      case "user.deleted":
        await handleUserDeleted(event);
        break;

      case "session.ended":
        await handleSessionEnded(event);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// ============= EVENT HANDLERS =============

async function handleUserCreated(event: ClerkWebhookEvent): Promise<void> {
  const {
    id,
    email_addresses,
    primary_email_address_id,
    first_name,
    last_name,
    image_url,
  } = event.data;

  console.log("👤 User Created Event - Clerk ID:", id);

  try {
    // Get primary email
    const primaryEmail = email_addresses?.find(
      (email) => email.id === primary_email_address_id
    );

    if (!primaryEmail) {
      console.error("❌ No primary email found for user:", id);
      return;
    }

    const email = primaryEmail.email_address.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId: id }, { email: email }],
      },
    });

    if (existingUser) {
      console.log("⚠️  User already exists:", email);

      // If it's a JWT user with same email, don't overwrite
      if (existingUser.password && !existingUser.clerkId) {
        console.log("⚠️  Email belongs to JWT user, skipping creation");
        return;
      }

      // Update clerkId if missing
      if (!existingUser.clerkId && existingUser.email === email) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkId: id },
        });
        console.log("✅ Updated existing user with Clerk ID");
      }
      return;
    }

    // Create new user
    const name = first_name ? `${first_name} ${last_name || ""}`.trim() : null;

    const newUser = await prisma.user.create({
      data: {
        clerkId: id,
        email: email,
        name: name,
        imageUrl: image_url || null,
        password: null, // Clerk users don't have password
      },
    });

    console.log("✅ User created in database:", newUser.email);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  }
}

async function handleUserUpdated(event: ClerkWebhookEvent): Promise<void> {
  const {
    id,
    email_addresses,
    primary_email_address_id,
    first_name,
    last_name,
    image_url,
  } = event.data;

  console.log("✏️  User Updated Event - Clerk ID:", id);

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (!user) {
      console.warn("⚠️  User not found, creating instead:", id);
      await handleUserCreated(event);
      return;
    }

    // Get primary email
    const primaryEmail = email_addresses?.find(
      (email) => email.id === primary_email_address_id
    );

    const email = primaryEmail?.email_address.toLowerCase();
    const name = first_name ? `${first_name} ${last_name || ""}`.trim() : null;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { clerkId: id },
      data: {
        ...(email && { email }),
        ...(name !== undefined && { name }),
        ...(image_url !== undefined && { imageUrl: image_url || null }),
      },
    });

    console.log("✅ User updated:", updatedUser.email);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw error;
  }
}

async function handleUserDeleted(event: ClerkWebhookEvent): Promise<void> {
  const { id, deleted } = event.data;

  console.log("🗑️  User Deleted Event - Clerk ID:", id);

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (!user) {
      console.warn("⚠️  User not found for deletion:", id);
      return;
    }

    // Soft delete: Clear sensitive data but keep user record
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: `deleted_${id}@deleted.com`, // Anonymize email
        name: "Deleted User",
        imageUrl: null,
        password: null,
        clerkId: `deleted_${id}`, // Keep reference but mark as deleted
      },
    });

    console.log("✅ User soft deleted (anonymized):", id);

    // Optional: Delete all user's tasks
    const deletedTasks = await prisma.task.deleteMany({
      where: { userId: user.id },
    });

    console.log(`🗑️  Deleted ${deletedTasks.count} tasks for user ${id}`);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw error;
  }
}

async function handleSessionEnded(event: ClerkWebhookEvent): Promise<void> {
  const { id } = event.data;

  console.log("🔓 Session Ended Event - Session ID:", id);

  // Optional: Add session cleanup logic here
  // For example: invalidate tokens, log session end, etc.
}
