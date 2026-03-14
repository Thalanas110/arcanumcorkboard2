import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Filter, RotateCcw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { LogsTable } from "./LogsTable";
import { logService, type LogFilters, type SystemLog } from "@/services/logService";

export const LogsDashboard = () => {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<LogFilters>({
        level: "all",
        search: "",
        startDate: "",
        endDate: ""
    });
    const [draftFilters, setDraftFilters] = useState<LogFilters>({
        level: "all",
        search: "",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        fetchLogs(filters);
    }, []);

    const fetchLogs = async (activeFilters: LogFilters) => {
        setLoading(true);
        try {
            const data = await logService.fetchFiltered(activeFilters);
            setLogs(data);
        } catch (err) {
            // silently ignore — table shows empty state
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const nextFilters = { ...draftFilters };
        setFilters(nextFilters);
        fetchLogs(nextFilters);
    };

    const resetFilters = () => {
        const defaultFilters: LogFilters = {
            level: "all",
            search: "",
            startDate: "",
            endDate: ""
        };
        setDraftFilters(defaultFilters);
        setFilters(defaultFilters);
        fetchLogs(defaultFilters);
    };

    const getLevelPalette = (level: SystemLog["level"]): { text: [number, number, number]; fill: [number, number, number] } => {
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
        if (logs.length === 0) return;

        const doc = new jsPDF({ orientation: "landscape", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 14;
        const marginBottom = 12;
        const generatedAt = format(new Date(), "MMM d, yyyy HH:mm:ss");
        const exportPeriod =
            filters.startDate || filters.endDate
                ? `${filters.startDate || "Any"} to ${filters.endDate || "Any"}`
                : "All dates";
        const exportLevel = filters.level === "all" ? "All levels" : filters.level.toUpperCase();
        const exportSearch = filters.search?.trim() ? filters.search.trim() : "None";
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
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        doc.text(`Filters -> Date: ${exportPeriod} | Level: ${exportLevel} | Search: ${exportSearch}`, marginX, 32);

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

        const filename = `system-logs-${format(new Date(), "yyyyMMdd-HHmmss")}.pdf`;
        doc.save(filename);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">System Logs</h2>
                    <p className="text-muted-foreground">
                        Filter, review, and export system events
                    </p>
                </div>
                <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={loading || logs.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Filtered PDF
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="logs-filter-start">Start Date</Label>
                            <Input
                                id="logs-filter-start"
                                type="date"
                                value={draftFilters.startDate ?? ""}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="logs-filter-end">End Date</Label>
                            <Input
                                id="logs-filter-end"
                                type="date"
                                value={draftFilters.endDate ?? ""}
                                min={draftFilters.startDate || undefined}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Level</Label>
                            <Select
                                value={draftFilters.level ?? "all"}
                                onValueChange={(value: "all" | "info" | "warn" | "error") =>
                                    setDraftFilters((prev) => ({ ...prev, level: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All levels</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warn">Warn</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="logs-filter-search">Keyword / IP</Label>
                            <Input
                                id="logs-filter-search"
                                type="text"
                                placeholder="Search message or IP"
                                value={draftFilters.search ?? ""}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={applyFilters} size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                        <Button onClick={resetFilters} variant="outline" size="sm">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                        <p className="text-sm text-muted-foreground md:ml-auto">
                            {loading ? "Loading logs..." : `${logs.length} log${logs.length === 1 ? "" : "s"} matched`}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <LogsTable logs={logs} loading={loading} />
        </div>
    );
};
