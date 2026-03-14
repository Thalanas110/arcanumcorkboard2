import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Pin, Eye, EyeOff, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { PostModal } from "@/components/PostModal";
import { logger } from "@/lib/logger";
import { postService, type Post } from "@/services/postService";

interface PostsTableProps {
  posts: Post[];
  loading: boolean;
  onUpdate: () => void;
}

export const PostsTable = ({ posts, loading, onUpdate }: PostsTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);

  const handleExportPDF = () => {
    if (posts.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const marginBottom = 12;
    const generatedAt = format(new Date(), "MMM d, yyyy HH:mm:ss");
    const totalPosts = posts.length;
    const pinnedCount = posts.filter((post) => post.is_pinned).length;
    const hiddenCount = posts.filter((post) => post.is_hidden).length;
    const visibleCount = totalPosts - hiddenCount;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Posts Report", marginX, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, pageWidth - marginX, 18, { align: "right" });
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.text("Scope: All posts with full message contents", marginX, 32);

    const cardsY = 38;
    const gap = 5;
    const cardWidth = (pageWidth - marginX * 2 - gap * 3) / 4;
    const drawCard = (
      x: number,
      label: string,
      value: number,
      fill: [number, number, number],
      text: [number, number, number]
    ) => {
      doc.setFillColor(...fill);
      doc.roundedRect(x, cardsY, cardWidth, 16, 2, 2, "F");
      doc.setTextColor(...text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(String(value), x + 3, cardsY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(label, x + 3, cardsY + 13);
    };

    drawCard(marginX, "Total Posts", totalPosts, [241, 245, 249], [15, 23, 42]);
    drawCard(marginX + (cardWidth + gap), "Visible", visibleCount, [220, 252, 231], [22, 101, 52]);
    drawCard(marginX + (cardWidth + gap) * 2, "Pinned", pinnedCount, [219, 234, 254], [30, 64, 175]);
    drawCard(marginX + (cardWidth + gap) * 3, "Hidden", hiddenCount, [254, 226, 226], [153, 27, 27]);

    const tableData = posts.map((post) => [
      post.name,
      `Batch ${post.batch}`,
      post.message,
      post.facebook_link?.trim() ? post.facebook_link : "-",
      post.is_hidden ? "Hidden" : "Visible",
      post.is_pinned ? "Pinned" : "Regular",
      format(new Date(post.created_at), "yyyy-MM-dd HH:mm:ss")
    ]);

    const tableUsableWidth = pageWidth - marginX * 2;
    const nameColWidth = 32;
    const batchColWidth = 18;
    const facebookColWidth = 44;
    const visibilityColWidth = 20;
    const pinColWidth = 20;
    const createdColWidth = 32;
    const messageColWidth = tableUsableWidth - nameColWidth - batchColWidth - facebookColWidth - visibilityColWidth - pinColWidth - createdColWidth;

    autoTable(doc, {
      startY: cardsY + 24,
      head: [["Name", "Batch", "Message", "Facebook", "Visibility", "Pin", "Created"]],
      body: tableData,
      theme: "grid",
      margin: { left: marginX, right: marginX, bottom: marginBottom },
      tableWidth: tableUsableWidth,
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        textColor: [15, 23, 42],
        overflow: "linebreak",
        valign: "middle"
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: nameColWidth, overflow: "ellipsize" },
        1: { cellWidth: batchColWidth, halign: "center" },
        2: { cellWidth: messageColWidth, overflow: "linebreak" },
        3: { cellWidth: facebookColWidth, overflow: "linebreak" },
        4: { cellWidth: visibilityColWidth, halign: "center" },
        5: { cellWidth: pinColWidth, halign: "center" },
        6: { cellWidth: createdColWidth, halign: "center", overflow: "linebreak" }
      },
      didParseCell: (hookData) => {
        if (hookData.section !== "body" || hookData.column.index !== 4) return;
        const visibility = String(hookData.cell.raw).toLowerCase();
        if (visibility === "hidden") {
          hookData.cell.styles.fillColor = [254, 226, 226];
          hookData.cell.styles.textColor = [153, 27, 27];
          hookData.cell.styles.fontStyle = "bold";
          return;
        }

        hookData.cell.styles.fillColor = [220, 252, 231];
        hookData.cell.styles.textColor = [22, 101, 52];
        hookData.cell.styles.fontStyle = "bold";
      },
      didDrawPage: () => {
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        const totalPages = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - marginX, pageHeight - 8, { align: "right" });
      }
    });

    const filename = `posts-report-${format(new Date(), "yyyyMMdd-HHmmss")}.pdf`;
    doc.save(filename);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await postService.remove(deleteId);
      toast.success('Post deleted successfully');
      logger.info('Admin deleted a post', { postId: deleteId });
      onUpdate();
    } catch (err) {
      logger.error('Failed to delete post', { error: err, postId: deleteId });
      toast.error('Failed to delete post');
    } finally {
      setDeleteId(null);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      await postService.togglePin(id, currentPinned);
      toast.success(currentPinned ? 'Post unpinned' : 'Post pinned');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      await postService.toggleHide(id, currentHidden);
      toast.success(currentHidden ? 'Post visible' : 'Post hidden');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Manage all messages posted on the corkboard ({posts.length} total)
              </CardDescription>
            </div>
            <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={loading || posts.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No posts yet
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Batch {post.batch}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {post.message}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {post.is_pinned && (
                          <Badge variant="default" className="gap-1 mb-1 mr-1">
                            <Pin className="w-3 h-3" />
                            Pinned
                          </Badge>
                        )}
                        {post.is_hidden && (
                          <Badge variant="destructive" className="gap-1 mb-1 mr-1">
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewPost(post)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTogglePin(post.id, post.is_pinned)}
                          >
                            <Pin className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleHide(post.id, post.is_hidden)}
                          >
                            {post.is_hidden ? (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(post.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {viewPost && (
        <PostModal
          post={viewPost}
          open={!!viewPost}
          onClose={() => setViewPost(null)}
          showAdminDetails={true}
        />
      )}
    </>
  );
};