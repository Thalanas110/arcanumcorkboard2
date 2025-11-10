import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { PostForm } from "@/components/PostForm";
import { PostModal } from "@/components/PostModal";
import { Pin, Plus } from "lucide-react";
import backgroundImage from "@/assets/anniversary-bg.jpg";

interface Post {
  id: string;
  name: string;
  batch: number;
  message: string;
  image_url: string | null;
  is_pinned: boolean;
  created_at: string;
}

const Corkboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <header className="border-b border-border/50 bg-card/95 backdrop-blur-md sticky top-0 z-20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pin className="w-8 h-8 text-primary rotate-45" />
                <div>
                  <h1 className="text-3xl font-bold text-primary">
                    Arcanum Academy Corkboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    4th Monthsary Celebration • November
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  Post a Message
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => window.location.href = '/admin'}
                  className="shadow-lg hover:shadow-xl transition-shadow"
                >
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Posts Grid */}
        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Loading messages...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No messages yet. Be the first to post!
              </p>
              <Button onClick={() => setShowForm(true)} size="lg">
                Post a Message
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

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