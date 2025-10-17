import { pgTable, text, uuid, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

// Profiles table - stores user information
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProfileSchema = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// User roles table - stores role assignments (admin/student)
export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  role: text("role", { enum: ["admin", "student"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "student"]),
});
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// Videos table - stores video content organized by folders
export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  folder: text("folder").notNull(),
  title: text("title").notNull(),
  folderOrder: integer("folder_order").notNull(),
  videoOrder: integer("video_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoSchema = z.object({
  folder: z.string(),
  title: z.string(),
  folderOrder: z.number(),
  videoOrder: z.number(),
});
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Student progress table - tracks video completion status
export const studentProgress = pgTable("student_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  videoId: uuid("video_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStudentProgressSchema = z.object({
  userId: z.string().uuid(),
  videoId: z.string().uuid(),
  completed: z.boolean(),
  completedAt: z.union([z.string().datetime(), z.date()]).nullable().optional(),
});
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;
