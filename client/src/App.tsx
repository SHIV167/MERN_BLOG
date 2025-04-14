import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BlogIndex from "@/pages/blog/index";
import BlogPost from "@/pages/blog/post";
import Projects from "@/pages/projects";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProjects from "@/pages/admin/projects";
import AdminBlogPosts from "@/pages/admin/blog-posts";
import AdminSkills from "@/pages/admin/skills";
import AdminContacts from "@/pages/admin/contacts";
import AdminVideos from "@/pages/admin/videos";
import AdminEditor from "@/pages/admin/editor";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";

// Layout component for public pages
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        {() => (
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        )}
      </Route>
      <Route path="/auth" component={AuthPage} />
      <Route path="/blog">
        {() => (
          <PublicLayout>
            <BlogIndex />
          </PublicLayout>
        )}
      </Route>
      <Route path="/blog/:slug">
        {(params) => (
          <PublicLayout>
            <BlogPost />
          </PublicLayout>
        )}
      </Route>
      <Route path="/projects">
        {() => (
          <PublicLayout>
            <Projects />
          </PublicLayout>
        )}
      </Route>
      
      {/* Admin routes - protected */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/projects" component={AdminProjects} />
      <ProtectedRoute path="/admin/projects/new" component={AdminEditor} />
      <ProtectedRoute path="/admin/projects/:id/edit" component={AdminEditor} />
      <ProtectedRoute path="/admin/blog" component={AdminBlogPosts} />
      <ProtectedRoute path="/admin/blog/new" component={AdminEditor} />
      <ProtectedRoute path="/admin/blog/:id/edit" component={AdminEditor} />
      <ProtectedRoute path="/admin/skills" component={AdminSkills} />
      <ProtectedRoute path="/admin/contacts" component={AdminContacts} />
      <ProtectedRoute path="/admin/videos" component={AdminVideos} />
      
      {/* Fallback to 404 */}
      <Route>
        {() => (
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
