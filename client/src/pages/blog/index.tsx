import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Blog, Category } from '@shared/schema';
import { Search, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function BlogIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Fetch blog posts
  const { data: blogs, isLoading: isBlogsLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  // Filter blogs by search term
  const filteredBlogs = blogs?.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate blogs
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredBlogs?.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = filteredBlogs ? Math.ceil(filteredBlogs.length / postsPerPage) : 0;

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always include first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Add ellipsis if current page is > 3
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add previous page if not first page
      if (currentPage > 2) {
        items.push(
          <PaginationItem key={currentPage - 1}>
            <PaginationLink
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Add current page if not first or last
      if (currentPage !== 1 && currentPage !== totalPages) {
        items.push(
          <PaginationItem key={currentPage}>
            <PaginationLink isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Add next page if not last
      if (currentPage < totalPages - 1) {
        items.push(
          <PaginationItem key={currentPage + 1}>
            <PaginationLink
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Add ellipsis if current page is < totalPages - 2
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Always include last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <>
      <Navbar />
      
      <section className="bg-gradient-to-r from-primary to-purple-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Insights, tutorials, and thoughts on web development, programming, and technology.
          </p>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-3/4">
              {/* Search */}
              <div className="mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search blog posts..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              {/* Blog posts grid */}
              {isBlogsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-gray-200 animate-pulse"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                        <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentPosts && currentPosts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentPosts.map((blog) => (
                      <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl">
                        <Link href={`/blog/${blog.slug}`}>
                          <div className="relative h-48">
                            <img 
                              src={blog.imageUrl} 
                              alt={blog.title} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-primary text-white">
                                {getCategoryName(blog.categoryId)}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                        <div className="p-6">
                          <Link href={`/blog/${blog.slug}`}>
                            <h2 className="text-xl font-bold mb-2 hover:text-primary transition duration-200">
                              {blog.title}
                            </h2>
                          </Link>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {blog.excerpt}
                          </p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(blog.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              Shiv Jha
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-12">
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                          </PaginationItem>
                        )}
                        
                        {getPaginationItems()}
                        
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <h3 className="text-xl font-medium mb-2">No blog posts found</h3>
                  {searchTerm ? (
                    <p className="text-gray-600">
                      No results match your search term "{searchTerm}". Try different keywords.
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      There are no blog posts available yet. Check back soon!
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full lg:w-1/4 space-y-8">
              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">Categories</h3>
                <ul className="space-y-2">
                  {categories?.map((category) => (
                    <li key={category.id}>
                      <a 
                        href="#" 
                        className="text-gray-700 hover:text-primary transition-colors flex justify-between items-center py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchTerm(category.name);
                          setCurrentPage(1);
                        }}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {blogs?.filter(blog => blog.categoryId === category.id).length || 0}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recent Posts */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">Recent Posts</h3>
                <ul className="space-y-4">
                  {blogs?.slice(0, 5).map((blog) => (
                    <li key={blog.id}>
                      <Link href={`/blog/${blog.slug}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={blog.imageUrl} 
                              alt={blog.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                              {blog.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Tags Cloud */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["React", "JavaScript", "Node.js", "MongoDB", "Express", "Web Dev", "Frontend", "Backend", "Full Stack", "API"].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      onClick={() => {
                        setSearchTerm(tag);
                        setCurrentPage(1);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
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
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
