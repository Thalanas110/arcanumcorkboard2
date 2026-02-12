import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, Facebook } from "lucide-react";
import { logger } from "@/lib/logger";

interface PostFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostForm = ({ open, onClose, onSuccess }: PostFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    message: '',
    facebookLink: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [facebookLinkError, setFacebookLinkError] = useState<string>('');

  const validateFacebookLink = (link: string): boolean => {
    if (!link.trim()) {
      setFacebookLinkError('Facebook link is required');
      return false;
    }
    
    const facebookRegex = /^https?:\/\/(www\.|m\.)?facebook\.com\/.*$|^https?:\/\/(www\.)?fb\.com\/.*$/i;
    
    if (!facebookRegex.test(link)) {
      setFacebookLinkError('Please enter a valid Facebook profile link (e.g., https://facebook.com/your.profile)');
      return false;
    }
    
    setFacebookLinkError('');
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024) {
        toast.error('Image must be less than 100KB');
        return;
      }
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    // Reset the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.batch || !formData.message.trim() || !formData.facebookLink.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Facebook link
    if (!validateFacebookLink(formData.facebookLink)) {
      toast.error('Please enter a valid Facebook profile link');
      return;
    }

    setLoading(true);

    try {
      // Check rate limit
      const { data: rateLimitData } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('ip_address', 'anonymous')
        .single();

      if (rateLimitData) {
        const lastPost = new Date(rateLimitData.last_post_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastPost.getTime()) / (1000 * 60);

        if (diffMinutes < 5) {
          toast.error(`Please wait ${Math.ceil(5 - diffMinutes)} minutes before posting again`);
          setLoading(false);
          return;
        }
      }

      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `posts/${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          name: formData.name.trim(),
          batch: parseInt(formData.batch),
          message: formData.message.trim(),
          image_url: imageUrl,
          facebook_link: formData.facebookLink.trim(),
        });

      if (postError) throw postError;

      // Update rate limit
      if (rateLimitData) {
        await supabase
          .from('rate_limits')
          .update({ last_post_at: new Date().toISOString() })
          .eq('ip_address', 'anonymous');
      } else {
        await supabase
          .from('rate_limits')
          .insert({ ip_address: 'anonymous' });
      }

      toast.success('Message posted successfully!');
      logger.info('New message posted', {
        name: formData.name,
        batch: formData.batch,
        hasImage: !!imageUrl
      });
      onSuccess();
    } catch (error) {
      console.error('Error posting message:', error);
      logger.error('Failed to post message', { error });
      toast.error('Failed to post message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Message</DialogTitle>
          <DialogDescription>
            Share your message for your secret people!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookLink">Facebook Account Link *</Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="facebookLink"
                value={formData.facebookLink}
                onChange={(e) => {
                  setFormData({ ...formData, facebookLink: e.target.value });
                  if (facebookLinkError) setFacebookLinkError('');
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    validateFacebookLink(e.target.value);
                  }
                }}
                placeholder="https://facebook.com/your.profile"
                className={`pl-9 ${facebookLinkError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                required
              />
            </div>
            {facebookLinkError && (
              <p className="text-xs text-red-500">
                {facebookLinkError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Only visible to administrators. Required for verification.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch *</Label>
            <Select
              value={formData.batch}
              onValueChange={(value) => setFormData({ ...formData, batch: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Batch 1</SelectItem>
                <SelectItem value="2">Batch 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your message here..."
              rows={5}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.message.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image (optional, max 100KB)</Label>
            <div className="space-y-2 w-full min-w-0">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                className="w-full flex items-center justify-start gap-2 min-w-0 overflow-hidden"
              >
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="truncate min-w-0 text-left block overflow-hidden text-ellipsis whitespace-nowrap max-w-0 flex-1">
                  {imageFile ? imageFile.name : 'Choose Image'}
                </span>
              </Button>
              {imageFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="w-full"
                  title="Remove image"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Image
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};