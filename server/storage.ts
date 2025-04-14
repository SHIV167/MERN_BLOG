import {
  User,
  InsertUser,
  Project,
  InsertProject,
  Skill,
  InsertSkill,
  Category,
  InsertCategory,
  Blog,
  InsertBlog,
  Video,
  InsertVideo,
  Contact,
  InsertContact,
  UserModel,
  ProjectModel,
  SkillModel,
  CategoryModel,
  BlogModel,
  VideoModel,
  ContactModel
} from "@shared/schema";
import { Types } from 'mongoose';
import session from "express-session";
import MongoStore from "connect-mongo";
import db from "./db";

// Define interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
  
  // Skill operations
  getAllSkills(): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | null>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, skill: Partial<InsertSkill>): Promise<Skill | null>;
  deleteSkill(id: string): Promise<boolean>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Blog operations
  getAllBlogs(published?: boolean): Promise<Blog[]>;
  getFeaturedBlogs(): Promise<Blog[]>;
  getBlog(id: string): Promise<Blog | null>;
  getBlogBySlug(slug: string): Promise<Blog | null>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog | null>;
  deleteBlog(id: string): Promise<boolean>;
  
  // Video operations
  getAllVideos(): Promise<Video[]>;
  getFeaturedVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | null>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video | null>;
  deleteVideo(id: string): Promise<boolean>;
  
  // Contact operations
  getAllContacts(): Promise<Contact[]>;
  getUnreadContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | null>;
  createContact(contact: InsertContact): Promise<Contact>;
  markContactAsRead(id: string): Promise<Contact | null>;
  deleteContact(id: string): Promise<boolean>;
  
  // For auth sessions
  sessionStore: session.Store;
}

// MongoDB storage implementation
export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Use MongoDB for session storage
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
      collectionName: 'sessions'
    });
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    return UserModel.findById(id);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return UserModel.findOne({ username });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    return user.save();
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return ProjectModel.find().sort({ createdAt: -1 });
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return ProjectModel.find({ featured: true }).sort({ createdAt: -1 });
  }

  async getProject(id: string): Promise<Project | null> {
    return ProjectModel.findById(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject = new ProjectModel(project);
    return newProject.save();
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | null> {
    return ProjectModel.findByIdAndUpdate(id, project, { new: true });
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await ProjectModel.findByIdAndDelete(id);
    return !!result;
  }

  // Skill operations
  async getAllSkills(): Promise<Skill[]> {
    return SkillModel.find().sort({ order: 1 });
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return SkillModel.find({ category }).sort({ order: 1 });
  }

  async getSkill(id: string): Promise<Skill | null> {
    return SkillModel.findById(id);
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const newSkill = new SkillModel(skill);
    return newSkill.save();
  }

  async updateSkill(id: string, skill: Partial<InsertSkill>): Promise<Skill | null> {
    return SkillModel.findByIdAndUpdate(id, skill, { new: true });
  }

  async deleteSkill(id: string): Promise<boolean> {
    const result = await SkillModel.findByIdAndDelete(id);
    return !!result;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return CategoryModel.find().sort({ name: 1 });
  }

  async getCategory(id: string): Promise<Category | null> {
    return CategoryModel.findById(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return CategoryModel.findOne({ slug });
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = new CategoryModel(category);
    return newCategory.save();
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | null> {
    return CategoryModel.findByIdAndUpdate(id, category, { new: true });
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  // Blog operations
  async getAllBlogs(published?: boolean): Promise<Blog[]> {
    const query = published !== undefined ? { published } : {};
    return BlogModel.find(query).sort({ createdAt: -1 });
  }

  async getFeaturedBlogs(): Promise<Blog[]> {
    return BlogModel.find({ published: true }).sort({ createdAt: -1 }).limit(3);
  }

  async getBlog(id: string): Promise<Blog | null> {
    return BlogModel.findById(id);
  }

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    return BlogModel.findOne({ slug });
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const blogWithDates = {
      ...blog,
      updatedAt: new Date()
    };
    const newBlog = new BlogModel(blogWithDates);
    return newBlog.save();
  }

  async updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog | null> {
    const blogWithUpdatedDate = {
      ...blog,
      updatedAt: new Date()
    };
    return BlogModel.findByIdAndUpdate(id, blogWithUpdatedDate, { new: true });
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await BlogModel.findByIdAndDelete(id);
    return !!result;
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    return VideoModel.find().sort({ order: 1 });
  }

  async getFeaturedVideos(): Promise<Video[]> {
    return VideoModel.find({ featured: true }).sort({ order: 1 });
  }

  async getVideo(id: string): Promise<Video | null> {
    return VideoModel.findById(id);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const newVideo = new VideoModel(video);
    return newVideo.save();
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video | null> {
    return VideoModel.findByIdAndUpdate(id, video, { new: true });
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await VideoModel.findByIdAndDelete(id);
    return !!result;
  }

  // Contact operations
  async getAllContacts(): Promise<Contact[]> {
    return ContactModel.find().sort({ createdAt: -1 });
  }

  async getUnreadContacts(): Promise<Contact[]> {
    return ContactModel.find({ read: false }).sort({ createdAt: -1 });
  }

  async getContact(id: string): Promise<Contact | null> {
    return ContactModel.findById(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const newContact = new ContactModel(contact);
    return newContact.save();
  }

  async markContactAsRead(id: string): Promise<Contact | null> {
    return ContactModel.findByIdAndUpdate(id, { read: true }, { new: true });
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await ContactModel.findByIdAndDelete(id);
    return !!result;
  }
}

// Create and export a storage instance
export const storage = new MongoDBStorage();
