import { useState, useEffect } from "react";
import { postService, type Post } from "@/services/postService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import { PostsTable } from "./PostsTable";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { LogsDashboard } from "./LogsDashboard";
import { LoadingScreen } from "@/components/LoadingScreen";

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchPosts = async () => {
    try {
      const data = await postService.fetchAll();
      setPosts(data);
    } catch (err) {
      // Error is swallowed intentionally — UI shows empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    return postService.subscribeToChanges('admin-posts-changes', fetchPosts);
  }, []);

  // Show loading screen if still loading
  if (!initialLoadComplete) {
    return (
      <LoadingScreen
        isLoading={loading}
        onComplete={() => setInitialLoadComplete(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Arcanum Academy Corkboard Management
                </p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="analytics">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="posts">
              <MessageSquare className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="logs">
              <LogOut className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard posts={posts} loading={loading} />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <PostsTable posts={posts} loading={loading} onUpdate={fetchPosts} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};