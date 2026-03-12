import { supabase } from "@/integrations/supabase/client";

export const rateLimitService = {
  /**
   * Returns the number of minutes remaining if the user is rate-limited,
   * or null if they are allowed to post.
   *
   * The IP is resolved server-side via `inet_client_addr()` inside the
   * Postgres function — the client cannot spoof it.
   */
  async getRemainingMinutes(): Promise<number | null> {
    const { data, error } = await supabase.rpc("get_rate_limit_status");
    if (error) throw error;
    return (data as number | null) ?? null;
  },

  /**
   * Record that the caller just posted.
   * The Postgres function upserts using the real connecting IP.
   */
  async recordPost(): Promise<void> {
    const { error } = await supabase.rpc("record_rate_limit_post");
    if (error) throw error;
  },
};
