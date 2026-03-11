import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { LogsTable } from "./LogsTable";
import { logService, type SystemLog } from "@/services/logService";

export const LogsDashboard = () => {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await logService.fetchRecent();
            setLogs(data);
        } catch (err) {
            // silently ignore — table shows empty state
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text("System Logs Report", 14, 20);

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Prepare table data
        const tableData = logs.map(log => [
            log.level.toUpperCase(),
            log.message,
            log.ip_address ?? '—',
            format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')
        ]);

        // Generate table
        autoTable(doc, {
            startY: 40,
            head: [['Level', 'Message', 'IP Address', 'Time']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }, // Blue header
            // Color code rows based on level could be added here but simple for now
        });

        doc.save("system-logs.pdf");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">System Logs</h2>
                    <p className="text-muted-foreground">
                        Recent system events and errors
                    </p>
                </div>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </div>
            <LogsTable logs={logs} loading={loading} />
        </div>
    );
};
