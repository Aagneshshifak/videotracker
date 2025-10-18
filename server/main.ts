import "dotenv/config";
import express from "express";
import path from "path";
import app from "./index";
import { registerRoutes } from "./routes";

const PORT = parseInt(process.env.PORT || "3000", 10);

async function startServer() {
  await registerRoutes(app);

  // Serve static files from the React app build
  app.use(express.static(path.join(__dirname, "../dist")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
