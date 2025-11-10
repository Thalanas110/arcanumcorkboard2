import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import { PostsTable } from "./PostsTable";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { LoadingScreen } from "@/components/LoadingScreen";

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      // Only set loading to false, let LoadingScreen handle timing
      setLoading(false);
    }
  };

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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analytics">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="posts">
              <MessageSquare className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard posts={posts} loading={loading} />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <PostsTable posts={posts} loading={loading} onUpdate={fetchPosts} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};