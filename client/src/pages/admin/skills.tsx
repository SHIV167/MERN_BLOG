import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/sidebar';
import DataTable from '@/components/admin/data-table';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skill, insertSkillSchema } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';

// Extended skill schema with validation
const skillFormSchema = insertSkillSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  percentage: z.coerce.number().min(0).max(100),
  category: z.string(),
  order: z.coerce.number().min(0),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

export default function AdminSkills() {
  const { toast } = useToast();
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch skills
  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ['/api/skills'],
    queryFn: async () => {
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error('Failed to fetch skills');
      return res.json();
    }
  });

  // Form setup
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: '',
      percentage: 75,
      category: 'frontend',
      order: 0,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SkillFormValues) => {
      await apiRequest('POST', '/api/admin/skills', data);
    },
    onSuccess: () => {
      toast({
        title: 'Skill created',
        description: 'The skill has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create skill',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/skills/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Skill deleted',
        description: 'The skill has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      setSkillToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete skill',
        variant: 'destructive',
      });
    },
  });

  // Columns for the data table
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as keyof Skill,
    },
    {
      header: 'Category',
      accessorKey: 'category' as keyof Skill,
      cell: (skill: Skill) => (
        <Badge variant="outline" className="capitalize">
          {skill.category}
        </Badge>
      ),
    },
    {
      header: 'Percentage',
      accessorKey: 'percentage' as keyof Skill,
      cell: (skill: Skill) => (
        <div className="w-full max-w-xs flex items-center gap-2">
          <Progress value={skill.percentage} className="h-2" />
          <span className="text-sm text-muted-foreground min-w-[40px] text-right">
            {skill.percentage}%
          </span>
        </div>
      ),
    },
    {
      header: 'Order',
      accessorKey: 'order' as keyof Skill,
    },
  ];

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setSkillToDelete(id);
  };

  const confirmDelete = () => {
    if (skillToDelete) {
      deleteMutation.mutate(skillToDelete);
    }
  };

  // Handle form submission
  const onSubmit = (data: SkillFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Skills</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Skill</DialogTitle>
                  <DialogDescription>
                    Create a new skill to showcase on your portfolio.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Skill Name</Label>
                    <Input
                      id="name"
                      placeholder="React.js"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      defaultValue={form.getValues('category')}
                      onValueChange={value => form.setValue('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Proficiency (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register('percentage')}
                    />
                    {form.formState.errors.percentage && (
                      <p className="text-sm text-red-500">{form.formState.errors.percentage.message}</p>
                    )}
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
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Saving...' : 'Save Skill'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <DataTable
            data={skills || []}
            columns={columns}
            primaryKey="id"
            onDelete={handleDeleteClick}
            isLoading={isLoading}
          />
          
          <AlertDialog open={skillToDelete !== null} onOpenChange={(open) => !open && setSkillToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the skill and remove it from your portfolio.
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
