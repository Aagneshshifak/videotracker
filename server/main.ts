import "dotenv/config";
import app from "./index";
import { registerRoutes } from "./routes";

const PORT = parseInt(process.env.PORT || "3000", 10);

async function startServer() {
  await registerRoutes(app);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
