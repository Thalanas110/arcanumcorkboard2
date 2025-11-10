import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";

interface Post {
  id: string;
  name: string;
  batch: number;
  message: string;
  image_url: string | null;
  is_pinned: boolean;
  created_at: string;
}

interface PostModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
}

export const PostModal = ({ post, open, onClose }: PostModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              {post.is_pinned && (
                <Pin className="w-5 h-5 text-accent" style={{ transform: 'rotate(45deg)' }} />
              )}
              {post.name}
            </DialogTitle>
            <Badge variant="secondary">
              Batch {post.batch}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Posted on {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={post.image_url} 
                alt="Post attachment"
                className="w-full h-auto max-h-96 object-contain bg-muted"
              />
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {post.message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};