import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  name: string;
  batch: number;
  message: string;
  image_url: string | null;
  facebook_link: string;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
}

export type RealtimeCallback = () => void;

export const postService = {
  /** Fetch all visible (non-hidden) posts, pinned first. */
  async fetchPublic(): Promise<Post[]> {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Post[]) ?? [];
  },

  /** Fetch all posts (admin view). */
  async fetchAll(): Promise<Post[]> {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Post[]) ?? [];
  },

  /** Create a new post. */
  async create(
    payload: Pick<Post, "name" | "batch" | "message" | "facebook_link"> & {
      image_url: string | null;
    }
  ): Promise<void> {
    const { error } = await supabase.from("posts").insert(payload);
    if (error) throw error;
  },

  /** Delete a post by id. */
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
  },

  /** Toggle is_pinned on a post. */
  async togglePin(id: string, currentPinned: boolean): Promise<void> {
    const { error } = await supabase
      .from("posts")
      .update({ is_pinned: !currentPinned })
      .eq("id", id);
    if (error) throw error;
  },

  /** Toggle is_hidden on a post. */
  async toggleHide(id: string, currentHidden: boolean): Promise<void> {
    const { error } = await supabase
      .from("posts")
      .update({ is_hidden: !currentHidden })
      .eq("id", id);
    if (error) throw error;
  },

  /** Subscribe to any change on the posts table. Returns an unsubscribe fn. */
  subscribeToChanges(channelName: string, callback: RealtimeCallback): () => void {
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
