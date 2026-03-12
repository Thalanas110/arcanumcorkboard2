import { supabase } from "@/integrations/supabase/client";

export interface Batch {
  batch_number: number;
  label: string;
  created_at: string;
}

export const batchService = {
  /** Fetch all batches ordered by batch_number. */
  async fetchAll(): Promise<Batch[]> {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("batch_number", { ascending: true });

    if (error) throw error;
    return (data as unknown as Batch[]) ?? [];
  },

  /** Add a new batch. */
  async create(batch_number: number, label: string): Promise<void> {
    const { error } = await supabase
      .from("batches")
      .insert({ batch_number, label });
    if (error) throw error;
  },

  /** Delete a batch by batch_number.
   *  Will throw if any posts still reference this batch (FK restrict). */
  async remove(batch_number: number): Promise<void> {
    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("batch_number", batch_number);
    if (error) throw error;
  },
};
