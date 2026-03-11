import { useState, useEffect } from "react";
import { postService, type Post } from "@/services/postService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, LayoutDashboard, MessageSquare, Layers, Menu } from "lucide-react";
import { PostsTable } from "./PostsTable";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { LogsDashboard } from "./LogsDashboard";
import { BatchDashboard } from "./BatchDashboard";
import { LoadingScreen } from "@/components/LoadingScreen";

interface AdminDashboardProps {
  onLogout: () => void;
}

const navItems = [
  { value: "analytics", label: "Analytics", icon: LayoutDashboard },
  { value: "posts", label: "Posts", icon: MessageSquare },
  { value: "batches", label: "Batches", icon: Layers },
  { value: "logs", label: "Logs", icon: LogOut },
];

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
              {/* Mobile side nav trigger */}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-60 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 px-4 py-5 border-b">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Admin</span>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                      {navItems.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setActiveTab(value);
                            setMobileNavOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === value
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </nav>
                    <div className="px-2 py-4 border-t">
                      <button
                        onClick={() => {
                          setMobileNavOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <LayoutDashboard className="w-6 h-6 text-primary hidden md:block" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Arcanum Academy Corkboard Management
                </p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="hidden md:flex">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop tab bar — hidden on mobile */}
          <TabsList className="hidden md:grid w-full max-w-xl grid-cols-4">
            {navItems.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard posts={posts} loading={loading} />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <PostsTable posts={posts} loading={loading} onUpdate={fetchPosts} />
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <BatchDashboard />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};