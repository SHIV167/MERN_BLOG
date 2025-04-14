import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Blog, Category } from '@shared/schema';
import { 
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const { slug } = params;
  const [, navigate] = useLocation();

  // Fetch blog post by slug
  const { 
    data: blog, 
    isLoading, 
    isError 
  } = useQuery<Blog>({
    queryKey: [`/api/blogs/slug/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/slug/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch blog post');
      return res.json();
    }
  });

  // Fetch categories to display category name
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    enabled: !!blog
  });

  // Fetch related blogs (same category)
  const { data: relatedBlogs } = useQuery<Blog[]>({
    queryKey: ['/api/blogs', blog?.categoryId],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch related blogs');
      return res.json();
    },
    enabled: !!blog,
    select: (data) => 
      data
        .filter(post => post.id !== blog?.id && post.categoryId === blog?.categoryId)
        .slice(0, 3)
  });

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Get category name
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Handle share links
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog?.title || 'Blog Post';

  const handleShare = (platform: string) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        return;
    }
    
    window.open(shareLink, '_blank');
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading blog post...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !blog) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-purple-500 text-white py-20">
        <div className="absolute right-0 top-0 dot-pattern h-full w-1/3 opacity-20"></div>
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-4 text-white hover:bg-white/20"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
          
          <Badge className="bg-white text-primary mb-4">
            {getCategoryName(blog.categoryId)}
          </Badge>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center text-sm gap-4 md:gap-6 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(blog.createdAt)}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Shiv Jha
            </div>
          </div>
        </div>
      </section>
      
      {/* Blog Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-[400px] overflow-hidden">
              <img 
                src={blog.imageUrl} 
                alt={blog.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="p-6 md:p-10">
              {/* Blog content */}
              <div 
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              
              {/* Share buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-gray-200 pt-6 mt-10">
                <span className="font-medium flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share this post:
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-9 w-9 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-9 w-9 text-sky-500 border-sky-200 hover:bg-sky-50"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-9 w-9 text-blue-700 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-9 w-9 text-gray-500 border-gray-200 hover:bg-gray-50"
                    onClick={() => handleShare('copy')}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Posts */}
          {relatedBlogs && relatedBlogs.length > 0 && (
            <div className="max-w-4xl mx-auto mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <div key={relatedBlog.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <a href={`/blog/${relatedBlog.slug}`}>
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={relatedBlog.imageUrl} 
                          alt={relatedBlog.title} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        />
                      </div>
                      <div className="p-4">
                        <Badge variant="outline" className="mb-2">
                          {getCategoryName(relatedBlog.categoryId)}
                        </Badge>
                        <h3 className="font-bold mb-2 hover:text-primary transition-colors">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(relatedBlog.createdAt)}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </>
  );
}

// Helper function to format dates
function formatDate(dateString: string | undefined | null) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
