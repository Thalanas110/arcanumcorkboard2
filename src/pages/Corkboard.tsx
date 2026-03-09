import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { PostForm } from "@/components/PostForm";
import { PostModal } from "@/components/PostModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Pin, Plus, Menu, X } from "lucide-react";
import backgroundImage from "@/assets/granite-texture.jpg";

interface Post {
  id: string;
  name: string;
  batch: number;
  message: string;
  image_url: string | null;
  facebook_link: string;
  is_pinned: boolean;
  created_at: string;
}

const Corkboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);

  // Fetch posts
  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('posts-changes')
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
        .eq('is_hidden', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as unknown as Post[]) || []);
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
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-autumn-brown/80 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 lg:px-8 lg:pt-6 sticky top-0 z-20 pointer-events-none">
          <header className="mx-auto max-w-7xl rounded-2xl border border-border/30 bg-card/85 backdrop-blur-md shadow-medium pointer-events-auto transition-all duration-300 hover:bg-card/90">
            <div className="container mx-auto px-4 py-4 lg:py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Pin className="w-8 h-8 text-primary relative z-10" style={{ transform: 'rotate(45deg)' }} />
                    <div className="absolute inset-0 bg-black/20 rounded-full blur-[4px] translate-y-2" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-primary drop-shadow-sm">
                      Anonymous Corkboard
                    </h1>
                    <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                      Confession Wall • Arcanum Academy
                    </p>
                  </div>
                </div>

                {/* Desktop Navigation (lg+ screens) */}
                <div className="hidden lg:flex items-center gap-4">
                  <Button
                    onClick={() => setShowForm(true)}
                    size="lg"
                    className="gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6"
                  >
                    <Plus className="w-5 h-5" />
                    Post a Message
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = '/admin'}
                    className="shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 rounded-full border-border/50 bg-background/50 hover:bg-background/80"
                  >
                    Admin
                  </Button>
                </div>

                {/* Mobile Menu Button (mobile/tablet screens) */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidenavOpen(true)}
                  className="lg:hidden rounded-full bg-background/50 border-border/50 shadow-sm"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>
        </div>

        {/* Posts Grid */}
        <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 mt-4 relative z-10 min-h-[70vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg text-card font-medium drop-shadow-md">Loading messages...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-card/90 backdrop-blur-sm p-10 rounded-3xl shadow-strong max-w-md border border-border/50 relative lift-effect paper-texture rotate-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-md">
                  <Pin className="w-8 h-8 text-slate-400 fill-slate-200" style={{ transform: 'rotate(45deg)' }} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3 font-handwritten">The Board is Empty</h2>
                <p className="text-foreground/80 mb-8 font-handwritten text-lg leading-relaxed">
                  There are no messages on the corkboard right now. Be the first to pin your thoughts!
                </p>
                <Button 
                  onClick={() => setShowForm(true)} 
                  size="lg" 
                  className="shadow-md hover:shadow-lg transition-all rounded-full"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Post a Message
                </Button>
              </div>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 md:gap-8 lg:gap-10 mx-auto px-2">
              {posts.map((post, index) => (
                <div key={post.id} className="group relative break-inside-avoid w-full">
                  <PostCard
                    post={post}
                    index={index}
                    onClick={() => setSelectedPost(post)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Side Navigation */}
      {sidenavOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidenavOpen(false)}
          />

          {/* Sidenav */}
          <div className="fixed top-0 right-0 h-full w-80 bg-card border-l border-border z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              {/* Close button */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold">Menu</h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidenavOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation items */}
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setSidenavOpen(false);
                  }}
                  size="lg"
                  className="w-full gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  Post a Message
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    window.location.href = '/admin';
                    setSidenavOpen(false);
                  }}
                  className="w-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showForm && (
        <PostForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchPosts();
          }}
        />
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Corkboard;