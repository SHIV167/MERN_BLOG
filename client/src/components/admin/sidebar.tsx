import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  ListChecks,
  Phone,
  Youtube,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Skills', href: '/admin/skills', icon: ListChecks },
    { name: 'Contact Messages', href: '/admin/contacts', icon: Phone },
    { name: 'YouTube Videos', href: '/admin/videos', icon: Youtube },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-slate-900 text-white transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        {!collapsed && (
          <Link href="/" className="text-xl font-bold truncate">
            SHIV JHA
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}>
                  <item.icon className={cn(
                    "flex-shrink-0 h-5 w-5", 
                    collapsed ? "mx-auto" : "mr-3"
                  )} />
                  {!collapsed && <span>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        {!collapsed ? (
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs font-medium text-slate-400">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-center border-slate-700 text-slate-300 hover:text-white hover:border-slate-600",
            collapsed ? "px-2" : ""
          )}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}
