import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Project } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  ExternalLink, 
  Search,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  // Fetch projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  // Get all unique technologies from projects
  const allTechnologies = projects
    ? [...new Set(projects.flatMap(project => project.technologies))]
    : [];

  // Filter projects by search term and technology filter
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = !filter || project.technologies.includes(filter);
    
    return matchesSearch && matchesFilter;
  });

  // Paginate projects
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects?.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = filteredProjects ? Math.ceil(filteredProjects.length / projectsPerPage) : 0;

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter click
  const handleFilterClick = (technology: string) => {
    if (filter === technology) {
      setFilter(null);
    } else {
      setFilter(technology);
    }
    setCurrentPage(1);
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-purple-500 text-white py-20">
        <div className="absolute right-0 top-0 dot-pattern h-full w-1/3 opacity-20"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Projects</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            A showcase of my work, personal projects, and contributions to the development community.
          </p>
        </div>
      </section>
      
      {/* Projects Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-2/3 justify-start md:justify-end">
                {allTechnologies.map((tech) => (
                  <Badge 
                    key={tech}
                    variant={filter === tech ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleFilterClick(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
                
                {filter && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFilter(null);
                      setCurrentPage(1);
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Projects grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="h-52 bg-gray-200 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                      <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentProjects && currentProjects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                      <div className="relative h-52 overflow-hidden">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 text-white">
                            <h3 className="font-bold">{project.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                              onClick={() => handleFilterClick(tech)}
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between mt-4">
                          {project.githubUrl && (
                            <a 
                              href={project.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-gray-700 hover:text-primary transition-colors"
                            >
                              <Github className="h-4 w-4 mr-1" />
                              <span className="text-sm">Code</span>
                            </a>
                          )}
                          {project.projectUrl && (
                            <a 
                              href={project.projectUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                            >
                              <span className="text-sm">Live Demo</span>
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                {searchTerm || filter ? (
                  <p className="text-gray-600">
                    No results match your search criteria. Try different keywords or filters.
                  </p>
                ) : (
                  <p className="text-gray-600">
                    There are no projects available yet. Check back soon!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
