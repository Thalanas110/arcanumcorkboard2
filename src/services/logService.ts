import { supabase } from "@/integrations/supabase/client";

export interface SystemLog {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface LogFilters {
  level?: "all" | "info" | "warn" | "error";
  search?: string;
  startDate?: string;
  endDate?: string;
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

  /** Fetch logs using optional filters. */
  async fetchFiltered(filters: LogFilters): Promise<SystemLog[]> {
    let query = supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (filters.level && filters.level !== "all") {
      query = query.eq("level", filters.level);
    }

    if (filters.startDate) {
      const startDateTime = new Date(`${filters.startDate}T00:00:00`).toISOString();
      query = query.gte("created_at", startDateTime);
    }

    if (filters.endDate) {
      const endDateTime = new Date(`${filters.endDate}T23:59:59.999`).toISOString();
      query = query.lte("created_at", endDateTime);
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      query = query.or(`message.ilike.%${search}%,ip_address.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as SystemLog[]) ?? [];
  },
};
