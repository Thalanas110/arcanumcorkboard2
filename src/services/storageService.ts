import { supabase } from "@/integrations/supabase/client";

const BUCKET = "post-images";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const storageService = {
  /** Upload an image file and return its public URL. */
  async uploadPostImage(file: File): Promise<string> {
    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
      );
    }

    const fileName = `posts/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { contentType: file.type });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return publicUrl;
  },
};
