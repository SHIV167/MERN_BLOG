import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

// Define the schema for user model
export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Define the schema for project model
export interface IProject extends Document {
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  authorId?: Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  technologies: { type: [String], required: true },
  projectUrl: { type: String },
  githubUrl: { type: String },
  featured: { type: Boolean, default: false },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Define skill categories
export const SkillCategories = ['frontend', 'backend', 'database', 'tools', 'cloud'] as const;
export type SkillCategory = typeof SkillCategories[number];

// Define the schema for skill model
export interface ISkill extends Document {
  name: string;
  percentage: number;
  category: SkillCategory;
  order: number;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: SkillCategories
  },
  order: { type: Number, required: true, default: 0 }
});

// Define the schema for category model
export interface ICategory extends Document {
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }
});

// Define the schema for blog model
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  categoryId?: Types.ObjectId;
  authorId?: Types.ObjectId;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  imageUrl: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Define the schema for video model
export interface IVideo extends Document {
  title: string;
  videoId: string;
  thumbnailUrl: string;
  views?: number;
  publishedAt?: Date;
  featured: boolean;
  order: number;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  videoId: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  views: { type: Number },
  publishedAt: { type: Date },
  featured: { type: Boolean, default: false },
  order: { type: Number, required: true, default: 0 }
});

// Define the schema for contact model
export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create and export the models
export const UserModel = model<IUser>('User', UserSchema);
export const ProjectModel = model<IProject>('Project', ProjectSchema);
export const SkillModel = model<ISkill>('Skill', SkillSchema);
export const CategoryModel = model<ICategory>('Category', CategorySchema);
export const BlogModel = model<IBlog>('Blog', BlogSchema);
export const VideoModel = model<IVideo>('Video', VideoSchema);
export const ContactModel = model<IContact>('Contact', ContactSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().default("user"),
});

export const insertProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  technologies: z.array(z.string()),
  projectUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  authorId: z.string().optional(),
});

export const insertSkillSchema = z.object({
  name: z.string().min(2),
  percentage: z.number().min(0).max(100),
  category: z.enum(SkillCategories),
  order: z.number().default(0),
});

export const insertCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

export const insertBlogSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  excerpt: z.string().min(10),
  imageUrl: z.string().url(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  published: z.boolean().default(false),
});

export const insertVideoSchema = z.object({
  title: z.string().min(3),
  videoId: z.string(),
  thumbnailUrl: z.string().url(),
  views: z.number().optional(),
  publishedAt: z.date().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export const insertContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

// Define types for imports/exports
export type User = IUser;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = IProject;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Skill = ISkill;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Category = ICategory;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Blog = IBlog;
export type InsertBlog = z.infer<typeof insertBlogSchema>;

export type Video = IVideo;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Contact = IContact;
export type InsertContact = z.infer<typeof insertContactSchema>;
