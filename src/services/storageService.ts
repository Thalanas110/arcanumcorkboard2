import { supabase } from "@/integrations/supabase/client";

const BUCKET = "post-images";

export const storageService = {
  /** Upload an image file and return its public URL. */
  async uploadPostImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const fileName = `posts/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return publicUrl;
  },
};
