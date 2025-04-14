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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Video, insertVideoSchema } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Youtube, Eye } from 'lucide-react';

// Extended video schema with validation
const videoFormSchema = insertVideoSchema.extend({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  videoId: z.string().min(5, { message: "YouTube video ID is required" }),
  thumbnailUrl: z.string().optional(),
  views: z.coerce.number().optional(),
  featured: z.boolean().default(false),
  order: z.coerce.number().min(0),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

export default function AdminVideos() {
  const { toast } = useToast();
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch videos
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    }
  });

  // Form setup
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      videoId: '',
      thumbnailUrl: '',
      views: 0,
      featured: false,
      order: 0,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: VideoFormValues) => {
      await apiRequest('POST', '/api/admin/videos', data);
    },
    onSuccess: () => {
      toast({
        title: 'Video created',
        description: 'The video has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add video',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/videos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Video deleted',
        description: 'The video has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setVideoToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete video',
        variant: 'destructive',
      });
    },
  });

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? match[2]
      : url; // Return as-is if it's already an ID
  };

  // Handle YouTube URL input
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      const videoId = extractVideoId(url);
      form.setValue('videoId', videoId);
      form.setValue('thumbnailUrl', `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
    }
  };

  // Columns for the data table
  const columns = [
    {
      header: 'Thumbnail',
      accessorKey: 'thumbnailUrl' as keyof Video,
      cell: (video: Video) => (
        <div className="relative w-16 h-12 overflow-hidden rounded">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      header: 'Title',
      accessorKey: 'title' as keyof Video,
    },
    {
      header: 'Video ID',
      accessorKey: 'videoId' as keyof Video,
      cell: (video: Video) => (
        <div className="flex items-center gap-2">
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{video.videoId}</code>
          <a 
            href={`https://www.youtube.com/watch?v=${video.videoId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-600"
          >
            <Eye className="h-4 w-4" />
          </a>
        </div>
      ),
    },
    {
      header: 'Featured',
      accessorKey: 'featured' as keyof Video,
      cell: (video: Video) => (
        video.featured ? (
          <Badge className="bg-green-500">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        )
      ),
    },
    {
      header: 'Order',
      accessorKey: 'order' as keyof Video,
    },
  ];

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setVideoToDelete(id);
  };

  const confirmDelete = () => {
    if (videoToDelete) {
      deleteMutation.mutate(videoToDelete);
    }
  };

  // Handle form submission
  const onSubmit = (data: VideoFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">YouTube Videos</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Video
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add YouTube Video</DialogTitle>
                  <DialogDescription>
                    Add a YouTube video to showcase on your portfolio.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      placeholder="How to Build a MERN Stack App"
                      {...form.register('title')}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
                    <Input
                      id="youtubeUrl"
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      onChange={handleVideoUrlChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the full YouTube URL, the video ID will be extracted automatically.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoId">Video ID</Label>
                    <Input
                      id="videoId"
                      placeholder="dQw4w9WgXcQ"
                      {...form.register('videoId')}
                    />
                    {form.formState.errors.videoId && (
                      <p className="text-sm text-red-500">{form.formState.errors.videoId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="views">Views (optional)</Label>
                    <Input
                      id="views"
                      type="number"
                      min="0"
                      placeholder="1000"
                      {...form.register('views')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="0"
                      {...form.register('order')}
                    />
                    {form.formState.errors.order && (
                      <p className="text-sm text-red-500">{form.formState.errors.order.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={form.watch('featured')}
                      onCheckedChange={(checked) => form.setValue('featured', checked)}
                    />
                    <Label htmlFor="featured">Feature this video on homepage</Label>
                  </div>
                  
                  <input
                    type="hidden"
                    {...form.register('thumbnailUrl')}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Adding...' : 'Add Video'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {videos && videos.length > 0 ? (
            <DataTable
              data={videos}
              columns={columns}
              primaryKey="id"
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          ) : !isLoading ? (
            <div className="text-center py-16 bg-white rounded-lg border">
              <Youtube className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Videos Added Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Add your YouTube videos to showcase your content on the portfolio.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Video
              </Button>
            </div>
          ) : null}
          
          <AlertDialog open={videoToDelete !== null} onOpenChange={(open) => !open && setVideoToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the video from your portfolio. The video will remain on YouTube.
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
