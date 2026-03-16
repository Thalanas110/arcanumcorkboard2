import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Log {
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    metadata: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
}

interface LogsTableProps {
    logs: Log[];
    loading: boolean;
}

const PAGE_SIZE = 15;

const getPageNumbers = (current: number, total: number): (number | "ellipsis")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
    if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
};

export const LogsTable = ({ logs, loading }: LogsTableProps) => {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [logs]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const totalPages = Math.ceil(logs.length / PAGE_SIZE);
    const paginatedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'info':
                return <Badge variant="secondary">Info</Badge>;
            case 'warn':
                return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">Warn</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="outline">{level}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Level</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No logs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                                    <TableCell className="font-medium">{log.message}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm font-mono">
                                        {log.ip_address ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                aria-disabled={page === 1}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {getPageNumbers(page, totalPages).map((n, i) =>
                            n === "ellipsis" ? (
                                <PaginationItem key={`ellipsis-${i}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={n}>
                                    <button
                                        onClick={() => setPage(n)}
                                        className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                                            page === n
                                                ? "border border-input bg-background shadow-sm"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                </PaginationItem>
                            )
                        )}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                aria-disabled={page === totalPages}
                                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};
