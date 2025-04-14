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
} from '@/components/ui/alert-dialog';
import { Blog } from '@shared/schema';
import { Link } from 'wouter';

export default function AdminBlogPosts() {
  const { toast } = useToast();
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  // Fetch blogs
  const { data: blogs, isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/blogs/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Blog post deleted',
        description: 'The blog post has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      setBlogToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete blog post',
        variant: 'destructive',
      });
    },
  });

  // Columns for the data table
  const columns = [
    {
      header: 'Title',
      accessorKey: 'title' as keyof Blog,
      cell: (blog: Blog) => (
        <Link href={`/admin/blog/${blog.id}/edit`} className="font-medium text-blue-600 hover:underline">
          {blog.title}
        </Link>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'published' as keyof Blog,
      cell: (blog: Blog) => (
        blog.published ? (
          <Badge className="bg-green-500">Published</Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        )
      ),
    },
    {
      header: 'Slug',
      accessorKey: 'slug' as keyof Blog,
      cell: (blog: Blog) => (
        <span className="text-sm text-gray-500">{blog.slug}</span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt' as keyof Blog,
      cell: (blog: Blog) => formatDate(blog.createdAt),
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt' as keyof Blog,
      cell: (blog: Blog) => formatDate(blog.updatedAt),
    },
  ];

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setBlogToDelete(id);
  };

  const confirmDelete = () => {
    if (blogToDelete) {
      deleteMutation.mutate(blogToDelete);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Blog Posts</h1>
          
          <DataTable
            data={blogs || []}
            columns={columns}
            primaryKey="id"
            onDelete={handleDeleteClick}
            addNewLink="/admin/blog/new"
            addNewText="Add New Post"
            isLoading={isLoading}
          />
          
          <AlertDialog open={blogToDelete !== null} onOpenChange={(open) => !open && setBlogToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the blog post and remove it from our servers.
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
