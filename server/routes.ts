import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProjectSchema, 
  insertSkillSchema, 
  insertBlogSchema, 
  insertVideoSchema, 
  insertContactSchema,
  insertCategorySchema
} from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(process.cwd(), "dist/public/uploads");
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, JPG, PNG and WEBP files are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Error handler for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    throw error;
  };

  // Helper to check if user is authenticated and is admin
  const isAdmin = (req: Request): boolean => {
    return req.isAuthenticated() && req.user.role === "admin";
  };

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const projects = featured 
        ? await storage.getFeaturedProjects() 
        : await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/admin/projects", upload.single("image"), async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      // Process file upload
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Image upload is required" });
      }
      
      // Parse technologies as array
      const technologies = req.body.technologies ? JSON.parse(req.body.technologies) : [];
      
      // Prepare project data
      const projectData = {
        ...req.body,
        technologies,
        imageUrl: `/uploads/${file.filename}`,
        authorId: req.user._id,
        featured: req.body.featured === "true",
      };
      
      // Validate and create project
      const validatedData = insertProjectSchema.parse(projectData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/admin/projects/:id", upload.single("image"), async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const existingProject = await storage.getProject(id);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Process file upload if provided
      let imageUrl = existingProject.imageUrl;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // Parse technologies as array if provided
      const technologies = req.body.technologies 
        ? JSON.parse(req.body.technologies) 
        : existingProject.technologies;
      
      // Prepare project data
      const projectData = {
        ...req.body,
        technologies,
        imageUrl,
        featured: req.body.featured === "true",
      };
      
      const updatedProject = await storage.updateProject(id, projectData);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const deleted = await storage.deleteProject(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Skills endpoints
  app.get("/api/skills", async (req, res) => {
    try {
      const category = req.query.category as string;
      const skills = category 
        ? await storage.getSkillsByCategory(category) 
        : await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/admin/skills", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const validatedData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(validatedData);
      res.status(201).json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.put("/api/admin/skills/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const updatedSkill = await storage.updateSkill(id, req.body);
      
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      console.error("Error updating skill:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/admin/skills/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const deleted = await storage.deleteSkill(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const updatedCategory = await storage.updateCategory(id, req.body);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Blog endpoints
  app.get("/api/blogs", async (req, res) => {
    try {
      const onlyPublished = !isAdmin(req);
      const blogs = await storage.getAllBlogs(onlyPublished);
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blogs/featured", async (req, res) => {
    try {
      const blogs = await storage.getFeaturedBlogs();
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching featured blog posts:", error);
      res.status(500).json({ message: "Failed to fetch featured blog posts" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const blog = await storage.getBlog(id);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Only return published blogs to non-admins
      if (!blog.published && !isAdmin(req)) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get("/api/blogs/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const blog = await storage.getBlogBySlug(slug);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Only return published blogs to non-admins
      if (!blog.published && !isAdmin(req)) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/admin/blogs", upload.single("image"), async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      // Process file upload
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Image upload is required" });
      }
      
      // Prepare blog data
      const blogData = {
        ...req.body,
        imageUrl: `/uploads/${file.filename}`,
        authorId: req.user._id,
        published: req.body.published === "true",
      };
      
      // Validate and create blog
      const validatedData = insertBlogSchema.parse(blogData);
      const blog = await storage.createBlog(validatedData);
      res.status(201).json(blog);
    } catch (error) {
      console.error("Error creating blog post:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blogs/:id", upload.single("image"), async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const existingBlog = await storage.getBlog(id);
      
      if (!existingBlog) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Process file upload if provided
      let imageUrl = existingBlog.imageUrl;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // Prepare blog data
      const blogData = {
        ...req.body,
        imageUrl,
        published: req.body.published === "true",
      };
      
      const updatedBlog = await storage.updateBlog(id, blogData);
      res.json(updatedBlog);
    } catch (error) {
      console.error("Error updating blog post:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blogs/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const deleted = await storage.deleteBlog(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.status(200).json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Video endpoints
  app.get("/api/videos", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const videos = featured 
        ? await storage.getFeaturedVideos() 
        : await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post("/api/admin/videos", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      // Parse thumbnail or generate from YouTube ID
      let thumbnailUrl = req.body.thumbnailUrl;
      if (!thumbnailUrl && req.body.videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${req.body.videoId}/mqdefault.jpg`;
      }
      
      // Prepare video data
      const videoData = {
        ...req.body,
        thumbnailUrl,
        featured: req.body.featured === "true",
        views: parseInt(req.body.views || "0"),
      };
      
      // Validate and create video
      const validatedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.put("/api/admin/videos/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const existingVideo = await storage.getVideo(id);
      
      if (!existingVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Update thumbnail if video ID changed
      let thumbnailUrl = req.body.thumbnailUrl || existingVideo.thumbnailUrl;
      if (req.body.videoId && req.body.videoId !== existingVideo.videoId && !req.body.thumbnailUrl) {
        thumbnailUrl = `https://img.youtube.com/vi/${req.body.videoId}/mqdefault.jpg`;
      }
      
      // Prepare video data
      const videoData = {
        ...req.body,
        thumbnailUrl,
        featured: req.body.featured === "true",
        views: req.body.views ? parseInt(req.body.views) : existingVideo.views,
      };
      
      const updatedVideo = await storage.updateVideo(id, videoData);
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete("/api/admin/videos/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const deleted = await storage.deleteVideo(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Contact endpoints
  app.get("/api/admin/contacts", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const unreadOnly = req.query.unread === "true";
      const contacts = unreadOnly 
        ? await storage.getUnreadContacts() 
        : await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/admin/contacts/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const contact = await storage.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  app.put("/api/admin/contacts/:id/read", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const updatedContact = await storage.markContactAsRead(id);
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updatedContact);
    } catch (error) {
      console.error("Error marking contact as read:", error);
      res.status(500).json({ message: "Failed to mark contact as read" });
    }
  });

  app.delete("/api/admin/contacts/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
      
      const id = req.params.id;
      const deleted = await storage.deleteContact(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Start HTTP server to listen for requests
  const server = createServer(app);
  return server;
}