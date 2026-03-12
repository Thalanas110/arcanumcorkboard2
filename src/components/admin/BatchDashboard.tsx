import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import { batchService, type Batch } from "@/services/batchService";
import { BatchesTable } from "./BatchesTable";

export const BatchDashboard = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [batchLabel, setBatchLabel] = useState("");

  const fetchBatches = async () => {
    try {
      const data = await batchService.fetchAll();
      setBatches(data);
    } catch (err) {
      logger.error("Failed to fetch batches", { error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(batchNumber, 10);
    if (!batchNumber || isNaN(num) || num < 1) {
      toast.error("Please enter a valid positive batch number");
      return;
    }
    if (!batchLabel.trim()) {
      toast.error("Please enter a label for the batch");
      return;
    }

    setAdding(true);
    try {
      await batchService.create(num, batchLabel.trim());
      toast.success(`Batch ${num} added`);
      logger.info("Admin added a batch", { batchNumber: num, label: batchLabel.trim() });
      setBatchNumber("");
      setBatchLabel("");
      await fetchBatches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("duplicate key") || msg.includes("unique")) {
        toast.error(`Batch ${num} already exists`);
      } else {
        toast.error("Failed to add batch");
      }
      logger.error("Failed to add batch", { error: err, batchNumber: num });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Batch Controller</h2>
        <p className="text-muted-foreground">
          Add or remove the batches available when students submit posts.
        </p>
      </div>

      {/* Add batch form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Batch</CardTitle>
          <CardDescription>
            Create a new batch that students can select when posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex flex-col gap-1.5 w-full sm:w-36">
              <Label htmlFor="batch-number">Batch Number</Label>
              <Input
                id="batch-number"
                type="number"
                min={1}
                placeholder="e.g. 3"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                disabled={adding}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="batch-label">Label</Label>
              <Input
                id="batch-label"
                type="text"
                placeholder="e.g. Batch 3"
                value={batchLabel}
                onChange={(e) => setBatchLabel(e.target.value)}
                disabled={adding}
              />
            </div>
            <Button type="submit" disabled={adding} className="shrink-0">
              <PlusCircle className="w-4 h-4 mr-2" />
              {adding ? "Adding..." : "Add Batch"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Batches list */}
      <BatchesTable batches={batches} loading={loading} onUpdate={fetchBatches} />
    </div>
  );
};
