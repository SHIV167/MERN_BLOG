import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/sidebar';
import DataTable from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Project } from '@shared/schema';
import { Link } from 'wouter';

export default function AdminProjects() {
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  // Fetch projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/projects/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });

  // Columns for the data table
  const columns = [
    {
      header: 'Title',
      accessorKey: 'title' as keyof Project,
      cell: (project: Project) => (
        <Link href={`/admin/projects/${project.id}/edit`} className="font-medium text-blue-600 hover:underline">
          {project.title}
        </Link>
      ),
    },
    {
      header: 'Featured',
      accessorKey: 'featured' as keyof Project,
      cell: (project: Project) => (
        project.featured ? (
          <Badge className="bg-green-500">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        )
      ),
    },
    {
      header: 'Technologies',
      accessorKey: 'technologies' as keyof Project,
      cell: (project: Project) => (
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.technologies.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt' as keyof Project,
      cell: (project: Project) => formatDate(project.createdAt),
    },
  ];

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setProjectToDelete(id);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Projects</h1>
          
          <DataTable
            data={projects || []}
            columns={columns}
            primaryKey="id"
            onDelete={handleDeleteClick}
            addNewLink="/admin/projects/new"
            addNewText="Add New Project"
            isLoading={isLoading}
          />
          
          <AlertDialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string | undefined | null) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
