import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { profiles, userRoles, videos, studentProgress } from "@shared/schema";
import type { InsertProfile, Profile, InsertUserRole, UserRole, InsertVideo, Video, InsertStudentProgress, StudentProgress } from "@shared/schema";

export interface IStorage {
  // Profile operations
  createProfile(data: InsertProfile & { userId: string }): Promise<Profile>;
  getProfileByUserId(userId: string): Promise<Profile | null>;
  getProfileByUsername(username: string): Promise<Profile | null>;
  getAllProfiles(): Promise<Profile[]>;
  updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile>;
  
  // User role operations
  getUserRole(userId: string): Promise<UserRole | null>;
  setUserRole(data: InsertUserRole): Promise<UserRole>;
  
  // Video operations
  getAllVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | null>;
  createVideo(data: InsertVideo): Promise<Video>;
  updateVideo(id: string, data: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  // Student progress operations
  getUserProgress(userId: string): Promise<StudentProgress[]>;
  getProgressByUserAndVideo(userId: string, videoId: string): Promise<StudentProgress | null>;
  createProgress(data: InsertStudentProgress): Promise<StudentProgress>;
  updateProgress(id: string, data: Partial<InsertStudentProgress>): Promise<StudentProgress>;
  getAllProgress(): Promise<(StudentProgress & { profile?: Profile })[]>;
}

export class DbStorage implements IStorage {
  // Profile operations
  async createProfile(data: InsertProfile & { userId: string }): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || null;
  }

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.username, username));
    return profile || null;
  }

  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles);
  }

  async updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  // User role operations
  async getUserRole(userId: string): Promise<UserRole | null> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return role || null;
  }

  async setUserRole(data: InsertUserRole): Promise<UserRole> {
    const [role] = await db.insert(userRoles).values(data).returning();
    return role;
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(videos.folderOrder, videos.videoOrder);
  }

  async getVideoById(id: string): Promise<Video | null> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || null;
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(data).returning();
    return video;
  }

  async updateVideo(id: string, data: Partial<InsertVideo>): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set(data)
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Student progress operations
  async getUserProgress(userId: string): Promise<StudentProgress[]> {
    return await db.select().from(studentProgress).where(eq(studentProgress.userId, userId));
  }

  async getProgressByUserAndVideo(userId: string, videoId: string): Promise<StudentProgress | null> {
    const [progress] = await db
      .select()
      .from(studentProgress)
      .where(and(eq(studentProgress.userId, userId), eq(studentProgress.videoId, videoId)));
    return progress || null;
  }

  async createProgress(data: InsertStudentProgress): Promise<StudentProgress> {
    const dbData = {
      ...data,
      completedAt: data.completedAt ? (typeof data.completedAt === 'string' ? new Date(data.completedAt) : data.completedAt) : null,
    };
    const [progress] = await db.insert(studentProgress).values(dbData).returning();
    return progress;
  }

  async updateProgress(id: string, data: Partial<InsertStudentProgress>): Promise<StudentProgress> {
    const dbData = {
      ...data,
      completedAt: data.completedAt ? (typeof data.completedAt === 'string' ? new Date(data.completedAt) : data.completedAt) : data.completedAt === null ? null : undefined,
      updatedAt: new Date(),
    };
    const [progress] = await db
      .update(studentProgress)
      .set(dbData)
      .where(eq(studentProgress.id, id))
      .returning();
    return progress;
  }

  async getAllProgress(): Promise<(StudentProgress & { profile?: Profile })[]> {
    const progressData = await db
      .select({
        progress: studentProgress,
        profile: profiles,
      })
      .from(studentProgress)
      .leftJoin(profiles, eq(studentProgress.userId, profiles.userId))
      .orderBy(desc(studentProgress.updatedAt));

    return progressData.map(({ progress, profile }) => ({
      ...progress,
      profile: profile || undefined,
    }));
  }
}

export const storage = new DbStorage();
