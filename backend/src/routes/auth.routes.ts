// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, refreshToken, logout, logoutAll } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

export default router;