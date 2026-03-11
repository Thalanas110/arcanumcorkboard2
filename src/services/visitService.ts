import { supabase } from "@/integrations/supabase/client";

export interface WebsiteVisit {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

export const visitService = {
  /** Fetch all website visits for analytics. */
  async fetchAll(): Promise<WebsiteVisit[]> {
    const { data, error } = await supabase
      .from("website_visits")
      .select("*");

    if (error) throw error;
    return (data as WebsiteVisit[]) ?? [];
  },
};
