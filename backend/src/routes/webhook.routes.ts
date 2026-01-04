// backend/src/routes/webhook.routes.ts - CLERK WEBHOOKS
import { Router } from "express";
import { handleClerkWebhook } from "../controllers/webhook.controller";
import express from "express";

const router = Router();

// ⚠️ IMPORTANT: Webhooks need raw body for signature verification
// This must be applied BEFORE express.json() middleware
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  handleClerkWebhook
);

export default router;