import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer as createViteServer } from "vite";
import { resolve } from "path";
import { existsSync } from "fs";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertProfileSchema, insertVideoSchema, insertStudentProgressSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

// Extend Express session types
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const role = await storage.getUserRole(req.session.userId);
  if (role?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express) {
  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const signupSchema = insertProfileSchema.extend({
        name: z.string().min(1, "Name is required"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      });

      const data = signupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getProfileByUsername(data.username.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const userId = randomUUID();

      // Create profile
      const profile = await storage.createProfile({
        userId,
        name: data.name,
        username: data.username.toLowerCase(),
        password: hashedPassword,
      });

      // Set default role as student
      await storage.setUserRole({
        userId,
        role: "student",
      });

      // Set session
      req.session.userId = userId;

      const role = await storage.getUserRole(userId);
      
      res.json({
        user: {
          id: profile.userId,
          username: profile.username,
          name: profile.name,
          role: role?.role || "student",
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const profile = await storage.getProfileByUsername(username.toLowerCase());
      if (!profile) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, profile.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = profile.userId;

      const role = await storage.getUserRole(profile.userId);

      res.json({
        user: {
          id: profile.userId,
          username: profile.username,
          name: profile.name,
          role: role?.role || "student",
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
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

      const role = await storage.getUserRole(profile.userId);

      res.json({
        user: {
          id: profile.userId,
          username: profile.username,
          name: profile.name,
          role: role?.role || "student",
        },
      });
    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({ error: "Failed to check session" });
    }
  });

  // Video routes
  app.get("/api/videos", requireAuth, async (req: Request, res: Response) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.post("/api/videos", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(data);
      res.json(video);
    } catch (error) {
      console.error("Create video error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.patch("/api/videos/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = insertVideoSchema.partial().parse(req.body);
      const video = await storage.updateVideo(id, data);
      res.json(video);
    } catch (error) {
      console.error("Update video error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/videos/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteVideo(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  // Progress routes
  app.get("/api/progress", requireAuth, async (req: Request, res: Response) => {
    try {
      const progress = await storage.getUserProgress(req.session.userId!);
      res.json(progress);
    } catch (error) {
      console.error("Get progress error:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertStudentProgressSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });

      // Check if progress already exists
      const existing = await storage.getProgressByUserAndVideo(
        req.session.userId!,
        data.videoId
      );

      let progress;
      if (existing) {
        progress = await storage.updateProgress(existing.id, data);
      } else {
        progress = await storage.createProgress(data);
      }

      res.json(progress);
    } catch (error) {
      console.error("Update progress error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Admin routes
  app.get("/api/admin/students", requireAdmin, async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getAllProfiles();
      const students = await Promise.all(
        profiles.map(async (profile) => {
          const role = await storage.getUserRole(profile.userId);
          return {
            id: profile.userId,
            username: profile.username,
            name: profile.name,
            role: role?.role || "student",
          };
        })
      );
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.get("/api/admin/students/:userId/progress", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Get student progress error:", error);
      res.status(500).json({ error: "Failed to fetch student progress" });
    }
  });

  app.get("/api/admin/progress", requireAdmin, async (req: Request, res: Response) => {
    try {
      const progress = await storage.getAllProgress();
      res.json(progress);
    } catch (error) {
      console.error("Get all progress error:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/admin/setup", requireAdmin, async (req: Request, res: Response) => {
    try {
      // This endpoint can be used for any admin setup tasks
      res.json({ success: true });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ error: "Failed to complete setup" });
    }
  });

  // Serve static files from dist folder if it exists, otherwise use Vite dev server
  const distPath = resolve(process.cwd(), "dist");
  
  if (existsSync(distPath)) {
    // Production mode: serve built static files
    app.use(express.static(distPath));
    
    // SPA fallback: serve index.html for all non-API routes
    app.use((req: Request, res: Response) => {
      // Return 404 for unknown API routes
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      // Serve SPA for all other routes
      res.sendFile(resolve(distPath, "index.html"));
    });
  } else {
    // Development mode: use Vite dev server
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: true,  // Enable HMR for development
      },
      appType: "spa",
      root: process.cwd(),
    });

    app.use(vite.middlewares);
  }
}
