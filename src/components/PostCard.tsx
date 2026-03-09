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
  index?: number;
}

const noteColors = [
  'bg-note-yellow',
  'bg-note-pink',
  'bg-note-blue',
  'bg-note-green',
];

export const PostCard = ({ post, onClick, index = 0 }: PostCardProps) => {
  const colorIndex = parseInt(post.id.slice(-1), 16) % noteColors.length;
  const noteColor = noteColors[colorIndex];
  const rotation = (parseInt(post.id.slice(-2), 16) % 6) - 3;
  const animationDelay = `${Math.min(index * 0.05, 0.5)}s`;

  return (
    <Card
      onClick={onClick}
      className={`${noteColor} p-5 pb-6 cursor-pointer lift-effect overflow-visible note-shadow paper-texture organic-shape relative flex flex-col min-h-[220px] mb-8 lg:mb-10`}
      style={{
        '--tw-rotate': `${rotation}deg`,
        transform: `rotate(${rotation}deg)`,
        animationDelay,
      } as React.CSSProperties}
    >
      {/* Tape effect (Optional, can be hidden if pin is better, but looks good mixed) */}
      {rotation % 2 === 0 && (
        <div className="absolute -top-3 right-4 w-16 h-6 bg-white/30 shadow-sm backdrop-blur-[2px] rotate-3 z-10 border border-white/40" />
      )}

      {/* 3D Pin */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 group-hover:-translate-y-1 scale-125">
        <div className="css-pin">
          <div className="css-pin-shadow" />
          <div className="css-pin-needle" />
          <div className="css-pin-base" />
          <div 
            className="css-pin-head" 
            style={{ 
              background: post.is_pinned 
                ? 'radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)' 
                : 'radial-gradient(circle at 30% 30%, #fff, #94a3b8)' 
            }} 
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 pt-3 flex-none">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground/90 text-[1.1rem] leading-tight line-clamp-2 font-handwritten">
            {post.name}
          </h3>
          <div className="shrink-0 transform rotate-3">
            <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold border-2 border-foreground/20 text-foreground/60 rounded-sm bg-transparent">
              Batch {post.batch}
            </span>
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="flex-grow flex flex-col justify-center">
        <p className="text-[15px] font-handwritten text-foreground/80 line-clamp-4 leading-relaxed whitespace-pre-line text-pretty">
          {post.message}
        </p>
      </div>

      {/* Image Indicator */}
      {post.image_url && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mt-2 font-medium">
          <span className="opacity-70">📸</span>
          <span>Attached photo</span>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-[11px] font-medium text-foreground/50 mt-4 pt-3 border-t border-foreground/10 flex-none uppercase tracking-wider">
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