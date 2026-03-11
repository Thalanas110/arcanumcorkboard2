import { supabase } from "@/integrations/supabase/client";

interface RateLimitRecord {
  ip_address: string;
  last_post_at: string;
}

const ANONYMOUS_IP = "anonymous";
const RATE_LIMIT_MINUTES = 5;

export const rateLimitService = {
  /**
   * Returns the number of minutes remaining if the user is rate-limited,
   * or null if they are allowed to post.
   */
  async getRemainingMinutes(): Promise<number | null> {
    const { data } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip_address", ANONYMOUS_IP)
      .single<RateLimitRecord>();

    if (!data) return null;

    const diffMinutes =
      (Date.now() - new Date(data.last_post_at).getTime()) / (1000 * 60);

    if (diffMinutes < RATE_LIMIT_MINUTES) {
      return Math.ceil(RATE_LIMIT_MINUTES - diffMinutes);
    }

    return null;
  },

  /** Record the current timestamp as the latest post for the anonymous user. */
  async recordPost(): Promise<void> {
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("ip_address")
      .eq("ip_address", ANONYMOUS_IP)
      .single<Pick<RateLimitRecord, "ip_address">>();

    if (existing) {
      await supabase
        .from("rate_limits")
        .update({ last_post_at: new Date().toISOString() })
        .eq("ip_address", ANONYMOUS_IP);
    } else {
      await supabase
        .from("rate_limits")
        .insert({ ip_address: ANONYMOUS_IP });
    }
  },
};
