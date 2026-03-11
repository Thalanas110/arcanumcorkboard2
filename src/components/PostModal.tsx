import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface PostModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  showAdminDetails?: boolean;
}

const noteColors = [
  'bg-note-yellow',
  'bg-note-pink',
  'bg-note-blue',
  'bg-note-green',
];

export const PostModal = ({ post, open, onClose, showAdminDetails }: PostModalProps) => {
  const colorIndex = post ? parseInt(post.id.slice(-1), 16) % noteColors.length : 0;
  const noteColor = noteColors[colorIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-2xl max-h-[85vh] overflow-y-auto ${noteColor} paper-texture border-none shadow-strong sm:rounded-xl`}>

        
        <DialogHeader className="pt-6 pb-2">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-3xl flex items-center gap-3 font-handwritten text-foreground/90 font-bold leading-tight">
              {post?.is_pinned && (
                <Pin className="w-8 h-8 text-autumn-crimson fill-autumn-crimson/80 shrink-0 drop-shadow-sm" style={{ transform: 'rotate(45deg)' }} />
              )}
              {post?.name}
            </DialogTitle>
            <div className="shrink-0 transform rotate-2 mt-1">
              <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider font-bold border-2 border-foreground/20 text-foreground/60 rounded-sm bg-transparent">
                Batch {post?.batch}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-foreground/50 mt-4 uppercase tracking-wider">
            Posted on {post ? new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) : ''}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {showAdminDetails && post.facebook_link && (
            <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2 text-sm">
              <Facebook className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Facebook Profile:</span>
              <a
                href={post.facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {post.facebook_link}
              </a>
            </div>
          )}

          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image_url}
                alt="Post attachment"
                className="w-full h-auto max-h-96 object-contain bg-muted"
              />
            </div>
          )}

          <div className="prose prose-sm max-w-none mt-2">
            <p className="text-[1.15rem] leading-relaxed whitespace-pre-wrap font-handwritten text-foreground/85">
              {post?.message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};