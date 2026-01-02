  // src/middleware/auth.middleware.ts
  import { Request, Response, NextFunction } from "express";
  import jwt from "jsonwebtoken";

  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

  export interface AuthRequest extends Request {
    userId?: number;
  }

  interface JwtPayload {
    id: number;
    email: string;
  }

  export const auth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
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

      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.userId = decoded.id;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: "Token expired" });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };