import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, Facebook } from "lucide-react";
import { logger } from "@/lib/logger";
import { postService } from "@/services/postService";
import { rateLimitService } from "@/services/rateLimitService";
import { storageService } from "@/services/storageService";

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

    if (!validateFacebookLink(formData.facebookLink)) {
      toast.error('Please enter a valid Facebook profile link');
      return;
    }

    setLoading(true);

    try {
      const remainingMinutes = await rateLimitService.getRemainingMinutes();
      if (remainingMinutes !== null) {
        toast.error(`Please wait ${remainingMinutes} minutes before posting again`);
        setLoading(false);
        return;
      }

      const imageUrl = imageFile
        ? await storageService.uploadPostImage(imageFile)
        : null;

      await postService.create({
        name: formData.name.trim(),
        batch: parseInt(formData.batch),
        message: formData.message.trim(),
        image_url: imageUrl,
        facebook_link: formData.facebookLink.trim(),
      });

      await rateLimitService.recordPost();

      toast.success('Message posted successfully!');
      logger.info('New message posted', {
        name: formData.name,
        batch: formData.batch,
        hasImage: !!imageUrl
      });
      onSuccess();
    } catch (err) {
      logger.error('Failed to post message', { error: err });
      toast.error('Failed to post message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto bg-[#fdfbf7] paper-texture border-none shadow-strong sm:rounded-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-handwritten font-bold text-foreground/90">Post a Message</DialogTitle>
          <DialogDescription className="font-medium text-foreground/60">
            Share your message for your secret people!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              maxLength={100}
              required
              className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-handwritten text-lg shadow-none"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="facebookLink" className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Facebook Account Link *</Label>
            <div className="relative">
              <Facebook className="absolute left-0 top-3 h-5 w-5 text-muted-foreground/50" />
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
                className={`pl-8 bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-handwritten text-lg shadow-none ${facebookLinkError ? 'border-red-500' : ''}`}
                required
              />
            </div>
            {facebookLinkError && (
              <p className="text-xs text-red-500 font-medium pt-1">
                {facebookLinkError}
              </p>
            )}
            <p className="text-[10px] uppercase text-muted-foreground font-medium pt-1">
              Only visible to administrators. Required for verification.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="batch" className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Batch *</Label>
            <Select
              value={formData.batch}
              onValueChange={(value) => setFormData({ ...formData, batch: value })}
              required
            >
              <SelectTrigger className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 focus:ring-0 focus:border-primary font-handwritten text-lg shadow-none">
                <SelectValue placeholder="Select your batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="font-handwritten text-base">Batch 1</SelectItem>
                <SelectItem value="2" className="font-handwritten text-base">Batch 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="message" className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your message here..."
              rows={5}
              maxLength={1000}
              required
              className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-handwritten text-lg resize-none min-h-[120px] shadow-none"
            />
            <p className="text-xs font-medium text-muted-foreground text-right pt-1">
              {formData.message.length}/1000
            </p>
          </div>

          <div className="space-y-1 pt-2">
            <Label htmlFor="image" className="text-foreground/70 font-bold uppercase tracking-wider text-[10px]">Image (optional, max 100KB)</Label>
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
                className="w-full flex items-center justify-start gap-2 min-w-0 overflow-hidden bg-white/50 border-foreground/10 hover:bg-white/80"
              >
                <Upload className="w-4 h-4 flex-shrink-0 text-foreground/70" />
                <span className="truncate min-w-0 text-left block overflow-hidden text-ellipsis whitespace-nowrap max-w-0 flex-1 font-handwritten text-base text-foreground/80">
                  {imageFile ? imageFile.name : 'Choose Image'}
                </span>
              </Button>
              {imageFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 uppercase text-[10px] tracking-wider font-bold h-8"
                  title="Remove image"
                >
                  <X className="w-3 h-3 mr-1" />
                  Remove Image
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border-foreground/20 hover:bg-foreground/5 font-bold"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
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