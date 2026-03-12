import { supabase } from "@/integrations/supabase/client";

export interface SystemLog {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const logService = {
  /** Fetch the most recent system logs (last 100). */
  async fetchRecent(): Promise<SystemLog[]> {
    const { data, error } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data as SystemLog[]) ?? [];
  },
};
