import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/sidebar';
import DashboardCard from '@/components/admin/dashboard-card';
import { 
  FileText, 
  FolderKanban, 
  BarChart, 
  Users, 
  Mail, 
  Youtube,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboard() {
  // Fetch projects count
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  // Fetch blogs count
  const { data: blogs } = useQuery({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    }
  });

  // Fetch contacts count
  const { data: contacts } = useQuery({
    queryKey: ['/api/admin/contacts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/contacts');
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return res.json();
    }
  });

  // Fetch videos count
  const { data: videos } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    }
  });

  // Calculate unread contacts
  const unreadContacts = contacts?.filter(contact => !contact.read) || [];

  // Get the 5 most recent contact messages
  const recentContacts = [...(contacts || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Projects"
              value={projects?.length || 0}
              icon={FolderKanban}
              iconColor="bg-blue-500"
            />
            
            <DashboardCard
              title="Blog Posts"
              value={blogs?.length || 0}
              icon={FileText}
              iconColor="bg-green-500"
            />
            
            <DashboardCard
              title="Contact Messages"
              value={contacts?.length || 0}
              description={`${unreadContacts.length} unread messages`}
              icon={Mail}
              iconColor="bg-amber-500"
            />
            
            <DashboardCard
              title="YouTube Videos"
              value={videos?.length || 0}
              icon={Youtube}
              iconColor="bg-red-500"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Content Overview */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
                <CardDescription>
                  Summary of your portfolio content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Projects</div>
                      <div className="text-sm text-muted-foreground">{projects?.length || 0} items</div>
                    </div>
                    <Progress value={projects?.length ? Math.min(projects.length * 10, 100) : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Blog Posts</div>
                      <div className="text-sm text-muted-foreground">{blogs?.length || 0} items</div>
                    </div>
                    <Progress value={blogs?.length ? Math.min(blogs.length * 5, 100) : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Videos</div>
                      <div className="text-sm text-muted-foreground">{videos?.length || 0} items</div>
                    </div>
                    <Progress value={videos?.length ? Math.min(videos.length * 10, 100) : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Contact Messages</div>
                      <div className="text-sm text-muted-foreground">{contacts?.length || 0} items</div>
                    </div>
                    <Progress value={contacts?.length ? Math.min(contacts.length * 2, 100) : 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Messages */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Latest contact form submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentContacts.length > 0 ? (
                  <div className="space-y-4">
                    {recentContacts.map((contact) => (
                      <div key={contact.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(contact.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{contact.subject}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{contact.message}</p>
                          {!contact.read && (
                            <span className="inline-block text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No contact messages yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string | undefined | null) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
