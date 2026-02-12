import { Pin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const noteColors = [
  'bg-note-yellow',
  'bg-note-pink',
  'bg-note-blue',
  'bg-note-green',
];

export const PostCard = ({ post, onClick }: PostCardProps) => {
  const colorIndex = parseInt(post.id.slice(-1), 16) % noteColors.length;
  const noteColor = noteColors[colorIndex];
  const rotation = (parseInt(post.id.slice(-2), 16) % 6) - 3;

  return (
    <Card
      onClick={onClick}
      className={`${noteColor} p-5 cursor-pointer hover:scale-105 transition-all duration-300 note-shadow paper-texture relative group`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Pin */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <Pin
          className={`w-6 h-6 ${post.is_pinned ? 'text-accent' : 'text-muted-foreground'} transform transition-transform group-hover:scale-110`}
          style={{ transform: 'rotate(45deg)' }}
        />
      </div>

      {/* Header */}
      <div className="mb-3 pt-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground text-lg line-clamp-1">
            {post.name}
          </h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            Batch {post.batch}
          </Badge>
        </div>
      </div>

      {/* Message Preview */}
      <p className="text-sm text-foreground/80 line-clamp-4 mb-3">
        {post.message}
      </p>

      {/* Image Indicator */}
      {post.image_url && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>📷</span>
          <span>Has image</span>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
        {new Date(post.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </Card>
  );
};