import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Wave } from '@/components/ui/wave';
import { ClockIcon } from '@/components/ui/clock-icon';
import { SkillProgress } from '@/components/ui/skill-progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MapPin, Linkedin, GitPullRequest, Twitter, Youtube, Instagram, Mail, Phone, Globe, ExternalLink } from 'lucide-react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { insertContactSchema } from '@shared/schema';
import { z } from 'zod';

// Extended contact schema with validation
const contactFormSchema = insertContactSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function HomePage() {
  const { toast } = useToast();

  // Fetch projects
  const { 
    data: projects,
    isLoading: isProjectsLoading 
  } = useQuery({
    queryKey: ['/api/projects', { featured: true }],
    queryFn: async () => {
      const res = await fetch('/api/projects?featured=true');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  // Fetch skills
  const { 
    data: frontendSkills,
    isLoading: isFrontendSkillsLoading 
  } = useQuery({
    queryKey: ['/api/skills', { category: 'frontend' }],
    queryFn: async () => {
      const res = await fetch('/api/skills?category=frontend');
      if (!res.ok) throw new Error('Failed to fetch frontend skills');
      return res.json();
    }
  });

  const { 
    data: backendSkills,
    isLoading: isBackendSkillsLoading 
  } = useQuery({
    queryKey: ['/api/skills', { category: 'backend' }],
    queryFn: async () => {
      const res = await fetch('/api/skills?category=backend');
      if (!res.ok) throw new Error('Failed to fetch backend skills');
      return res.json();
    }
  });

  // Fetch blogs
  const { 
    data: blogs,
    isLoading: isBlogsLoading 
  } = useQuery({
    queryKey: ['/api/blogs/featured'],
    queryFn: async () => {
      const res = await fetch('/api/blogs/featured');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    }
  });

  // Fetch videos
  const { 
    data: videos,
    isLoading: isVideosLoading 
  } = useQuery({
    queryKey: ['/api/videos', { featured: true }],
    queryFn: async () => {
      const res = await fetch('/api/videos?featured=true');
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  });

  // Contact form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await apiRequest('POST', '/api/contact', data);
      toast({
        title: 'Message sent successfully',
        description: 'Thanks for reaching out! I will get back to you soon.',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  // Scroll to section on hash change
  useEffect(() => {
    const scrollToSection = () => {
      const hash = window.location.hash;
      if (hash) {
        const section = document.querySelector(hash);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Scroll on initial load if hash exists
    scrollToSection();

    // Add event listener for hash changes
    window.addEventListener('hashchange', scrollToSection);

    // Clean up
    return () => {
      window.removeEventListener('hashchange', scrollToSection);
    };
  }, []);

  const featuredVideo = videos && videos.length > 0 ? videos[0] : null;
  const recentVideos = videos && videos.length > 1 ? videos.slice(1) : [];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-purple-500 text-white min-h-[500px] flex items-center">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20"
             style={{ backgroundImage: 'radial-gradient(#8054fe 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">MY Contact Is 9</h1>
              <div className="bg-white bg-opacity-20 text-white inline-block px-3 py-1 rounded-full text-sm font-medium mb-6">
                <FaMapMarkerAlt className="inline mr-2" /> New Delhi, India
              </div>
              <p className="text-lg mb-8 max-w-lg">
                Full-stack developer specialized in MERN stack with a passion for building beautiful, functional websites and applications.
              </p>
              <div className="flex space-x-4">
                <Link href="#contact">
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    Get in Touch
                  </Button>
                </Link>
                <Link href="#projects">
                  <Button variant="outline" className="border border-white text-white hover:bg-white hover:text-primary">
                    View Projects
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Developer working" 
                className="rounded-lg shadow-2xl max-w-md w-full" 
              />
            </div>
          </div>
        </div>
        <Wave />
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <ClockIcon />
            </div>
            <div className="w-full md:w-2/3 pl-0 md:pl-12">
              <h2 className="text-2xl font-bold mb-2">SHIV JHA</h2>
              <div className="h-1 w-20 bg-primary mb-6"></div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                I specialize in the MERN stack (MongoDB, Express.js, React.js, and Node.js). I have 5+ years of experience creating responsive, scalable web applications. My expertise includes database design, RESTful API development, front-end architecture, and deploying applications to cloud platforms.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                In addition to my technical skills, I have a passion for sharing knowledge through blogging and video tutorials on various programming topics. I believe in continuous learning and staying updated with the latest technologies and best practices.
              </p>
              <div className="flex space-x-4 mt-8">
                <a href="#" className="text-primary hover:text-primary-dark transition duration-200 text-xl">
                  <Linkedin />
                </a>
                <a href="#" className="text-primary hover:text-primary-dark transition duration-200 text-xl">
                  <GitPullRequest />
                </a>
                <a href="#" className="text-primary hover:text-primary-dark transition duration-200 text-xl">
                  <Twitter />
                </a>
                <a href="#" className="text-primary hover:text-primary-dark transition duration-200 text-xl">
                  <Youtube />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Skills & Expertise</h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I've developed a diverse set of skills across the full web development stack, specializing in MERN technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-secondary text-white py-3 px-4 font-bold">
                <h3 className="text-lg">FRONTEND SKILLS</h3>
              </div>
              <div className="p-4">
                {isFrontendSkillsLoading ? (
                  <div className="space-y-6 py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  frontendSkills?.map((skill) => (
                    <SkillProgress
                      key={skill.id}
                      name={skill.name}
                      percentage={skill.percentage}
                      colorClass="bg-secondary"
                    />
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary text-white py-3 px-4 font-bold">
                <h3 className="text-lg">BACKEND SKILLS</h3>
              </div>
              <div className="p-4">
                {isBackendSkillsLoading ? (
                  <div className="space-y-6 py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  backendSkills?.map((skill) => (
                    <SkillProgress
                      key={skill.id}
                      name={skill.name}
                      percentage={skill.percentage}
                      colorClass="bg-primary"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <h4 className="text-lg font-semibold mb-2">FRAMEWORKS</h4>
              <div className="space-y-1 text-sm">
                <p>React Native</p>
                <p>Next.js</p>
                <p>Bootstrap</p>
                <p>Material UI</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <h4 className="text-lg font-semibold mb-2">DATABASES</h4>
              <div className="space-y-1 text-sm">
                <p>MongoDB</p>
                <p>MySQL</p>
                <p>Firebase</p>
                <p>Redis</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <h4 className="text-lg font-semibold mb-2">TOOLS</h4>
              <div className="space-y-1 text-sm">
                <p>Git & GitPullRequest</p>
                <p>VS Code</p>
                <p>Docker</p>
                <p>Webpack</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <h4 className="text-lg font-semibold mb-2">CLOUD & DEV</h4>
              <div className="space-y-1 text-sm">
                <p>AWS</p>
                <p>Heroku</p>
                <p>Netlify</p>
                <p>Vercel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Projects (Brands)</h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here are some of my recent projects. Each one presented unique challenges that helped me grow as a developer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isProjectsLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-6 w-2/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-20 bg-gray-100 rounded mb-3"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 w-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              projects?.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl">
                  <div className="relative">
                    <img 
                      src={project.imageUrl}
                      alt={project.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-primary bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                      <div className="text-white text-center">
                        <div className="bg-primary-dark rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                          <ExternalLink className="h-5 w-5" />
                        </div>
                        <p className="font-medium">View Project</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/projects">
              <Button>View All Projects</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* YouTube Videos Section */}
      <section className="bg-gradient-to-r from-primary to-purple-500 py-16 relative">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20"
             style={{ backgroundImage: 'radial-gradient(#8054fe 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2 text-white">MY YOUTUBE VIDEOS</h2>
            <div className="h-1 w-20 bg-white mx-auto mb-6"></div>
            <p className="text-white opacity-80 max-w-2xl mx-auto">
              Check out my latest YouTube tutorials covering various programming topics and web development techniques.
            </p>
          </div>

          {isVideosLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-gray-900 rounded-lg overflow-hidden shadow-xl h-[315px] animate-pulse"></div>
              <div className="bg-gray-900 rounded-lg overflow-hidden h-[315px] animate-pulse"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                {featuredVideo && (
                  <iframe 
                    className="w-full" 
                    height="315" 
                    src={`https://www.youtube.com/embed/${featuredVideo.videoId}`} 
                    title={featuredVideo.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-800">
                  <h3 className="text-white font-bold">Recent Videos</h3>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '280px' }}>
                  {recentVideos.map((video) => (
                    <div key={video.id} className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition duration-200">
                      <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={`${video.title} thumbnail`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm text-white font-medium line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {video.views || 0} views • {formatDate(video.publishedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              <button className="h-2 w-8 bg-white bg-opacity-60 rounded-full"></button>
              <button className="h-2 w-8 bg-white rounded-full"></button>
              <button className="h-2 w-8 bg-white bg-opacity-60 rounded-full"></button>
            </div>
          </div>

          <div className="text-center mt-8">
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition duration-200"
            >
              <Youtube className="inline mr-2 h-5 w-5" /> Visit My Channel
            </a>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">BLOGS</h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I regularly write about web development, programming tips, and industry insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isBlogsLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                  <div className="h-56 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              blogs?.map((blog) => (
                <div key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition duration-300 hover:shadow-xl">
                  <div className="relative h-56">
                    <img 
                      src={blog.imageUrl} 
                      alt={blog.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      {blog.categoryId ? "JavaScript" : "Web Development"}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 hover:text-primary transition duration-200">{blog.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src="https://randomuser.me/api/portraits/men/32.jpg" 
                          alt="Author" 
                          className="w-8 h-8 rounded-full mr-2" 
                        />
                        <span className="text-xs text-gray-600">Shiv Jha</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                    </div>
                    <Link href={`/blog/${blog.slug}`}>
                      <Button variant="link" className="mt-4 p-0 text-primary hover:text-primary-dark font-medium text-sm">
                        Read More <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/blog">
              <Button>View All Blog Posts</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? Reach out to me through the contact form or using the information below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-6">Send Me a Message</h3>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Your Name</label>
                    <input
                      {...form.register('name')}
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Doe"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Your Email</label>
                    <input
                      {...form.register('email')}
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="john@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                    <input
                      {...form.register('subject')}
                      type="text"
                      id="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Project Inquiry"
                    />
                    {form.formState.errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                    <textarea
                      {...form.register('message')}
                      id="message"
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell me about your project..."
                    ></textarea>
                    {form.formState.errors.message && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary bg-opacity-10 rounded-full p-3 mr-4">
                      <MapPin className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Location</h4>
                      <p className="text-gray-600 mt-1">New Delhi, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary bg-opacity-10 rounded-full p-3 mr-4">
                      <Mail className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Email</h4>
                      <p className="text-gray-600 mt-1">contact@shivjha.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary bg-opacity-10 rounded-full p-3 mr-4">
                      <Phone className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Phone</h4>
                      <p className="text-gray-600 mt-1">+91 9876543210</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-6">Follow Me</h3>
                
                <div className="flex justify-around">
                  <a href="#" className="bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary h-12 w-12 rounded-full flex items-center justify-center transition duration-200">
                    <Linkedin />
                  </a>
                  <a href="#" className="bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary h-12 w-12 rounded-full flex items-center justify-center transition duration-200">
                    <GitPullRequest />
                  </a>
                  <a href="#" className="bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary h-12 w-12 rounded-full flex items-center justify-center transition duration-200">
                    <Twitter />
                  </a>
                  <a href="#" className="bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary h-12 w-12 rounded-full flex items-center justify-center transition duration-200">
                    <Youtube />
                  </a>
                  <a href="#" className="bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary h-12 w-12 rounded-full flex items-center justify-center transition duration-200">
                    <Instagram />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}

// Helper function to format dates
function formatDate(dateString: string | undefined | null) {
  if (!dateString) return 'Recent';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
