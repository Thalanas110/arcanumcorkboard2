import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogsTable } from "./LogsTable";

export const LogsDashboard = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
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
            </div>
            <LogsTable logs={logs} loading={loading} />
        </div>
    );
};
