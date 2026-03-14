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

    const getLevelPalette = (level: SystemLog["level"]) => {
        switch (level) {
            case "error":
                return { text: [153, 27, 27], fill: [254, 226, 226] };
            case "warn":
                return { text: [146, 64, 14], fill: [255, 237, 213] };
            case "info":
            default:
                return { text: [30, 64, 175], fill: [219, 234, 254] };
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: "landscape", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 14;
        const marginBottom = 12;
        const generatedAt = format(new Date(), "MMM d, yyyy HH:mm:ss");
        const totalLogs = logs.length;
        const infoCount = logs.filter((log) => log.level === "info").length;
        const warnCount = logs.filter((log) => log.level === "warn").length;
        const errorCount = logs.filter((log) => log.level === "error").length;

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 28, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("System Logs Report", marginX, 18);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated: ${generatedAt}`, pageWidth - marginX, 18, { align: "right" });

        const cardsY = 35;
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

        drawCard(marginX, "Total Logs", totalLogs, [241, 245, 249], [15, 23, 42]);
        drawCard(marginX + (cardWidth + gap), "Info", infoCount, [219, 234, 254], [30, 64, 175]);
        drawCard(marginX + (cardWidth + gap) * 2, "Warnings", warnCount, [255, 237, 213], [146, 64, 14]);
        drawCard(marginX + (cardWidth + gap) * 3, "Errors", errorCount, [254, 226, 226], [153, 27, 27]);

        const tableData = logs.map((log) => [
            log.level.toUpperCase(),
            log.message,
            log.ip_address ?? "-",
            format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")
        ]);

        const tableUsableWidth = pageWidth - marginX * 2;
        const levelColWidth = 24;
        const ipColWidth = 44;
        const timeColWidth = 46;
        const messageColWidth = tableUsableWidth - levelColWidth - ipColWidth - timeColWidth;

        autoTable(doc, {
            startY: cardsY + 24,
            head: [["Level", "Message", "IP Address", "Timestamp"]],
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
                0: { cellWidth: levelColWidth, halign: "center" },
                1: { cellWidth: messageColWidth, overflow: "linebreak" },
                2: { cellWidth: ipColWidth, halign: "center", overflow: "ellipsize" },
                3: { cellWidth: timeColWidth, halign: "center", overflow: "linebreak" }
            },
            didParseCell: (hookData) => {
                if (hookData.section !== "body" || hookData.column.index !== 0) return;
                const level = String(hookData.cell.raw).toLowerCase() as SystemLog["level"];
                const palette = getLevelPalette(level);
                hookData.cell.styles.fillColor = palette.fill;
                hookData.cell.styles.textColor = palette.text;
                hookData.cell.styles.fontStyle = "bold";
            },
            didDrawPage: () => {
                const pageNumber = doc.getCurrentPageInfo().pageNumber;
                const totalPages = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(
                    `Page ${pageNumber} of ${totalPages}`,
                    pageWidth - marginX,
                    pageHeight - 8,
                    { align: "right" }
                );
            }
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
