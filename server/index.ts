import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertProfileSchema, insertVideoSchema, insertStudentProgressSchema } from "@shared/schema";
import { z } from "zod";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const app = express();

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session setup
const PgSession = connectPgSimple(session);

console.log("Session configuration:", {
  nodeEnv: process.env.NODE_ENV,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log("Auth check - Session:", req.session, "User ID:", req.session.userId);
  if (!req.session.userId) {
    console.log("AUTH FAILED: No user ID in session");
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log("AUTH SUCCESS: User", req.session.userId);
  next();
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const role = await storage.getUserRole(req.session.userId);
  if (role?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  next();
};

// Authentication routes
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  try {
    const { username, password, name } = insertProfileSchema.parse(req.body);

    // Check if username already exists
    const existingUser = await storage.getProfileByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate userId
    const userId = crypto.randomUUID();

    // Create profile
    const profile = await storage.createProfile({
      userId,
      username,
      password: hashedPassword,
      name,
    });

    // Set default role as student
    await storage.setUserRole({ userId, role: "student" });

    // Set session
    req.session.userId = userId;

    res.json({
      user: {
        id: profile.userId,
        username: profile.username,
        name: profile.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user
    const profile = await storage.getProfileByUsername(username);
    if (!profile) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, profile.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get user role
    const roleData = await storage.getUserRole(profile.userId);

    // Set session
    req.session.userId = profile.userId;
    
    console.log("Login successful - Session set:", {
      userId: req.session.userId,
      sessionID: req.sessionID,
    });

    res.json({
      user: {
        id: profile.userId,
        username: profile.username,
        name: profile.name,
        role: roleData?.role || "student",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/api/auth/session", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  try {
    const profile = await storage.getProfileByUserId(req.session.userId);
    if (!profile) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    const roleData = await storage.getUserRole(profile.userId);

    res.json({
      user: {
        id: profile.userId,
        username: profile.username,
        name: profile.name,
        role: roleData?.role || "student",
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Video routes
app.get("/api/videos", requireAuth, async (req: Request, res: Response) => {
  try {
    console.log("GET /api/videos - User ID:", req.session.userId);
    const videoList = await storage.getAllVideos();
    console.log("Videos retrieved:", videoList.length);
    res.json(videoList);
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/videos", requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = insertVideoSchema.parse(req.body);
    const video = await storage.createVideo(data);
    res.json(video);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Create video error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/videos/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = insertVideoSchema.partial().parse(req.body);
    const video = await storage.updateVideo(id, data);
    res.json(video);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Update video error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/videos/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteVideo(id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Progress routes
app.get("/api/progress", requireAuth, async (req: Request, res: Response) => {
  try {
    console.log("GET /api/progress - User ID:", req.session.userId);
    const progress = await storage.getUserProgress(req.session.userId!);
    console.log("Progress retrieved:", progress.length);
    res.json(progress);
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/progress", requireAuth, async (req: Request, res: Response) => {
  try {
    const { videoId, completed, completedAt } = req.body;
    
    // Check if progress already exists
    const existing = await storage.getProgressByUserAndVideo(req.session.userId!, videoId);
    
    if (existing) {
      // Update existing progress
      const updated = await storage.updateProgress(existing.id, {
        completed,
        completedAt: completedAt ? new Date(completedAt) : completed ? new Date() : null,
      });
      return res.json(updated);
    }
    
    // Create new progress
    const progress = await storage.createProgress({
      userId: req.session.userId!,
      videoId,
      completed,
      completedAt: completedAt ? new Date(completedAt) : completed ? new Date() : null,
    });
    res.json(progress);
  } catch (error) {
    console.error("Create/update progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
app.get("/api/admin/students", requireAdmin, async (req: Request, res: Response) => {
  try {
    const profiles = await storage.getAllProfiles();
    const profilesWithRoles = await Promise.all(
      profiles.map(async (profile) => {
        const role = await storage.getUserRole(profile.userId);
        return {
          id: profile.userId,
          name: profile.name,
          username: profile.username,
          role: role?.role || "student",
        };
      })
    );
    res.json(profilesWithRoles);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/students/:userId/progress", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = await storage.getUserProgress(userId);
    res.json(progress);
  } catch (error) {
    console.error("Get student progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/progress", requireAdmin, async (req: Request, res: Response) => {
  try {
    const progress = await storage.getAllProgress();
    res.json(progress);
  } catch (error) {
    console.error("Get all progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin setup route (create initial admin user)
app.post("/api/admin/setup", async (req: Request, res: Response) => {
  try {
    // Check if admin already exists
    const allRoles = await storage.getAllProfiles();
    const adminExists = await Promise.all(
      allRoles.map(async (profile) => {
        const role = await storage.getUserRole(profile.userId);
        return role?.role === "admin";
      })
    );

    if (adminExists.some(Boolean)) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Create admin user
    const adminPassword = await bcrypt.hash("admin", 10);
    const adminUserId = crypto.randomUUID();

    const adminProfile = await storage.createProfile({
      userId: adminUserId,
      username: "admin",
      password: adminPassword,
      name: "Administrator",
    });

    await storage.setUserRole({
      userId: adminUserId,
      role: "admin",
    });

    res.json({
      message: "Admin user created successfully",
      username: "admin",
      password: "admin",
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
