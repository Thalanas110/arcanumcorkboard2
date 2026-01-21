import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Log {
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    metadata: any;
    created_at: string;
}

interface LogsTableProps {
    logs: Log[];
    loading: boolean;
}

export const LogsTable = ({ logs, loading }: LogsTableProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                No logs found
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{getLevelBadge(log.level)}</TableCell>
                                <TableCell className="font-medium">{log.message}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
