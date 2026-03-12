import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { logger } from "@/lib/logger";
import { batchService, type Batch } from "@/services/batchService";
import { format } from "date-fns";

interface BatchesTableProps {
  batches: Batch[];
  loading: boolean;
  onUpdate: () => void;
}

export const BatchesTable = ({ batches, loading, onUpdate }: BatchesTableProps) => {
  const [deleteNumber, setDeleteNumber] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteNumber === null) return;
    setDeleting(true);
    try {
      await batchService.remove(deleteNumber);
      toast.success(`Batch ${deleteNumber} deleted`);
      logger.info("Admin deleted a batch", { batchNumber: deleteNumber });
      onUpdate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("violates foreign key") || msg.includes("posts_batch_fkey")) {
        toast.error(`Cannot delete Batch ${deleteNumber}: posts still reference it`);
      } else {
        toast.error("Failed to delete batch");
      }
      logger.error("Failed to delete batch", { error: err, batchNumber: deleteNumber });
    } finally {
      setDeleting(false);
      setDeleteNumber(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading batches...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
          <CardDescription>
            Batches available for selection when posting ({batches.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No batches found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.batch_number}>
                      <TableCell>
                        <Badge variant="outline">#{batch.batch_number}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{batch.label}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(batch.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteNumber(batch.batch_number)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteNumber !== null} onOpenChange={() => setDeleteNumber(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch {deleteNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove Batch {deleteNumber}. This action cannot be undone.
              Deletion will fail if any posts are still associated with this batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
