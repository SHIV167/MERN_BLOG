import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminSidebar from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/ui/rich-text-editor';
import FileUpload from '@/components/ui/file-upload';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  insertProjectSchema, 
  insertBlogSchema,
  Project,
  Blog,
  Category
} from '@shared/schema';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

// Determine if we're editing a project or blog post based on URL
function useEditorType() {
  const [location] = useLocation();
  if (location.includes('/admin/projects')) return 'project';
  if (location.includes('/admin/blog')) return 'blog';
  return null;
}

// Create schema for the form based on the entity type
type EditorFormValues = 
  | z.infer<typeof insertProjectSchema>
  | z.infer<typeof insertBlogSchema>;

export default function AdminEditor() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams();
  const { id } = params;
  const editorType = useEditorType();
  const isNew = !id;
  const [formData, setFormData] = useState<EditorFormValues | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch categories for blog posts
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    enabled: editorType === 'blog'
  });

  // Fetch existing entity if editing
  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: [`/api/${editorType === 'project' ? 'projects' : 'blogs'}/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/${editorType === 'project' ? 'projects' : 'blogs'}/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch ${editorType}`);
      return res.json();
    },
    enabled: !!id && !!editorType,
  });

  // Form setup
  const form = useForm<EditorFormValues>({
    resolver: zodResolver(editorType === 'project' ? insertProjectSchema : insertBlogSchema),
    defaultValues: formData || {},
  });

  // Update form when existing data is loaded
  useEffect(() => {
    if (existingData && !formData) {
      setFormData(existingData);
      form.reset(existingData);
    }
  }, [existingData, form, formData]);

  // Initialize defaults for new entity
  useEffect(() => {
    if (isNew && !formData && editorType) {
      const defaults = editorType === 'project' 
        ? { 
            title: '',
            description: '',
            imageUrl: '',
            technologies: [],
            projectUrl: '',
            githubUrl: '',
            featured: false,
          }
        : {
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            imageUrl: '',
            categoryId: 0,
            published: false,
          };
      
      setFormData(defaults);
      form.reset(defaults);
    }
  }, [isNew, editorType, form, formData]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = isNew
        ? `/api/admin/${editorType === 'project' ? 'projects' : 'blogs'}`
        : `/api/admin/${editorType === 'project' ? 'projects' : 'blogs'}/${id}`;
      
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(endpoint, {
        method,
        body: data,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to ${isNew ? 'create' : 'update'} ${editorType}`);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `${editorType} ${isNew ? 'created' : 'updated'}`,
        description: `The ${editorType} has been ${isNew ? 'created' : 'updated'} successfully.`,
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/${editorType === 'project' ? 'projects' : 'blogs'}`] 
      });
      navigate(`/admin/${editorType === 'project' ? 'projects' : 'blog'}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${isNew ? 'create' : 'update'} ${editorType}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: EditorFormValues) => {
    // Create FormData object to handle file uploads
    const formData = new FormData();
    
    // Add file if selected
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    
    // Process form data based on editor type
    if (editorType === 'project') {
      const projectData = data as Project;
      
      // Handle technologies array
      if (Array.isArray(projectData.technologies)) {
        formData.append('technologies', JSON.stringify(projectData.technologies));
      }
      
      // Add other fields
      Object.entries(projectData).forEach(([key, value]) => {
        if (key !== 'technologies' && key !== 'imageUrl') {
          formData.append(key, String(value));
        }
      });
    } else {
      // Add all blog fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'imageUrl') {
          formData.append(key, String(value));
        }
      });
    }
    
    mutation.mutate(formData);
  };

  // Generate slug from title for blog posts
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  // Handle title change for blog posts to auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('title', e.target.value);
    
    if (editorType === 'blog' && isNew) {
      form.setValue('slug', generateSlug(e.target.value));
    }
  };

  // Handle technologies input for projects
  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const techsArray = e.target.value
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech !== '');
    
    form.setValue('technologies', techsArray);
  };

  // Format technologies array to comma-separated string
  const technologiesString = () => {
    const techs = form.watch('technologies');
    return Array.isArray(techs) ? techs.join(', ') : '';
  };

  // Page title
  const pageTitle = isNew 
    ? `New ${editorType === 'project' ? 'Project' : 'Blog Post'}`
    : `Edit ${editorType === 'project' ? 'Project' : 'Blog Post'}`;

  if (!editorType) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Invalid Editor Type</h1>
            <p>The URL is not valid. Please go back and try again.</p>
            <Button className="mt-4" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingExisting && !isNew) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p>Loading {editorType}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate(`/admin/${editorType === 'project' ? 'projects' : 'blog'}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={editorType === 'project' ? "My Awesome Project" : "My Blog Post Title"}
                  {...form.register('title')}
                  onChange={handleTitleChange}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message?.toString()}</p>
                )}
              </div>

              {editorType === 'blog' && (
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="my-blog-post-title"
                    {...form.register('slug')}
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-500">{form.formState.errors.slug.message?.toString()}</p>
                  )}
                </div>
              )}
              
              {editorType === 'project' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="projectUrl">Project URL (optional)</Label>
                    <Input
                      id="projectUrl"
                      placeholder="https://myproject.com"
                      {...form.register('projectUrl')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/repo"
                      {...form.register('githubUrl')}
                    />
                  </div>
                </>
              )}
              
              {editorType === 'blog' && (
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select 
                    defaultValue={form.watch('categoryId')?.toString()} 
                    onValueChange={(value) => form.setValue('categoryId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-500">{form.formState.errors.categoryId.message?.toString()}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <FileUpload
                id="image"
                accept="image/*"
                onChange={setSelectedFile}
                previewUrl={form.watch('imageUrl') as string}
                error={form.formState.errors.imageUrl?.message?.toString()}
              />
            </div>

            {editorType === 'project' && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  rows={3}
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message?.toString()}</p>
                )}
              </div>
            )}
            
            {editorType === 'blog' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="A short excerpt for blog previews..."
                    rows={3}
                    {...form.register('excerpt')}
                  />
                  {form.formState.errors.excerpt && (
                    <p className="text-sm text-red-500">{form.formState.errors.excerpt.message?.toString()}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <RichTextEditor
                    id="content"
                    label=""
                    value={form.watch('content') as string || ''}
                    onChange={(value) => form.setValue('content', value)}
                    error={form.formState.errors.content?.message?.toString()}
                    placeholder="Write your blog post content here..."
                  />
                </div>
              </>
            )}
            
            {editorType === 'project' && (
              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (comma separated)</Label>
                <Textarea
                  id="technologies"
                  placeholder="React, Node.js, MongoDB, Express"
                  rows={2}
                  value={technologiesString()}
                  onChange={handleTechnologiesChange}
                />
                {form.formState.errors.technologies && (
                  <p className="text-sm text-red-500">{form.formState.errors.technologies.message?.toString()}</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={form.watch('featured') as boolean || false}
                onCheckedChange={(checked) => form.setValue('featured', checked)}
              />
              <Label htmlFor="featured">
                {editorType === 'project' 
                  ? 'Feature this project on homepage' 
                  : 'Feature this blog post'
                }
              </Label>
            </div>

            {editorType === 'blog' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={form.watch('published') as boolean || false}
                  onCheckedChange={(checked) => form.setValue('published', checked)}
                />
                <Label htmlFor="published">Publish this blog post</Label>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/admin/${editorType === 'project' ? 'projects' : 'blog'}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isNew ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isNew ? 'Create' : 'Update'} {editorType === 'project' ? 'Project' : 'Post'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
