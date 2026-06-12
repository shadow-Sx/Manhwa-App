/**
 * types.ts
 * Type definitions for AniManxwa Reader Application
 */

export type MangaType = "Manga" | "Manhwa" | "Manhua" | "Novella";
export type MangaStatus = "Tugallangan" | "Davom etmoqda";
export type MangaBilling = "Obuna" | "Bepul";

export interface Manga {
  id: string;
  title: string;
  description: string;
  author: string;
  studio: string;
  year: number;
  type: MangaType;
  status: MangaStatus;
  billing: MangaBilling;
  volumes: number; // 0 means no volumes
  seasons: number; // 0 means no seasons
  genres: string[];
  coverUrl: string; // Base64 or standard asset
  createdAt: number;
  readCount: number;
}

export interface Chapter {
  id: string;
  mangaId: string;
  season?: number;
  volume?: number;
  chapterNumber: string; // "BOB" - required
  title?: string; // Optional
  pages: string[]; // Base64 or canvas image URLs
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "Admin" | "Foydalanuvchi";
  balance: number; // Summa in UZS (e.g. 50000)
  hasSubscription: boolean;
  history: string[]; // List of Manga IDs read
  isEgaAdmin?: boolean; // Flag if successfully verified as SsSsS20080216
}

export interface Favorites {
  mangaId: string;
  savedAt: number;
}

export interface TranslatorRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  experience: string;
  about: string;
  submittedAt: number;
  status: "Kutilmoqda" | "Qabul qilindi" | "Rad etildi";
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}
