import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Pin, Eye } from "lucide-react";
import { PostModal } from "@/components/PostModal";
import { logger } from "@/lib/logger";

interface PostsTableProps {
  posts: any[];
  loading: boolean;
  onUpdate: () => void;
}

export const PostsTable = ({ posts, loading, onUpdate }: PostsTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewPost, setViewPost] = useState<any | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success('Post deleted successfully');
      logger.info('Admin deleted a post', { postId: deleteId });
      onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      logger.error('Failed to delete post', { error, postId: deleteId });
      toast.error('Failed to delete post');
    } finally {
      setDeleteId(null);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: !currentPinned })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentPinned ? 'Post unpinned' : 'Post pinned');
      onUpdate();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update post');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            Manage all messages posted on the corkboard ({posts.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No posts yet
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Batch {post.batch}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {post.message}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {post.is_pinned && (
                          <Badge variant="default" className="gap-1">
                            <Pin className="w-3 h-3" />
                            Pinned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewPost(post)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTogglePin(post.id, post.is_pinned)}
                          >
                            <Pin className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(post.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {viewPost && (
        <PostModal
          post={viewPost}
          open={!!viewPost}
          onClose={() => setViewPost(null)}
        />
      )}
    </>
  );
};