// src/server.ts
import app from "./app";
import { initDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initDB();

    // TODO: Add token cleanup service later
    // startTokenCleanup();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 API Documentation:`);
      console.log(`   Authentication:`);
      console.log(`   - POST /api/auth/register       - Register new user`);
      console.log(`   - POST /api/auth/login          - Login user`);
      console.log(`   - POST /api/auth/refresh        - Refresh access token`);
      console.log(`   - POST /api/auth/logout         - Logout (revoke token)`);
      console.log(
        `   - POST /api/auth/logout-all     - Logout from all devices`
      );
      console.log(`   Tasks:`);
      console.log(`   - GET  /api/tasks               - Get all tasks`);
      console.log(`   - POST /api/tasks               - Create new task`);
      console.log(`   - GET  /api/tasks/completed     - Get completed tasks`);
      console.log(`   - GET  /api/tasks/urgent        - Get urgent tasks`);
      console.log(`   - GET  /api/tasks/search?q=...  - Search tasks`);
      console.log(`   - PUT  /api/tasks/:id           - Update task`);
      console.log(`   - DELETE /api/tasks/:id         - Delete task`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
