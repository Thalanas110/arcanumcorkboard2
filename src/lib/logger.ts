import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type LogLevel = 'info' | 'warn' | 'error';

let cachedIp: string | null = null;

const getClientIp = async (): Promise<string | null> => {
    if (cachedIp !== null) return cachedIp;
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json() as { ip: string };
        cachedIp = data.ip;
        return cachedIp;
    } catch {
        return null;
    }
};

class Logger {
    private async log(level: LogLevel, message: string, metadata: Record<string, unknown> = {}) {
        try {
            const ip_address = await getClientIp();
            await supabase.from('system_logs').insert({
                level,
                message,
                metadata: metadata as unknown as Json,
                ip_address,
            });
        } catch (error) {
            // Silently fail if logging fails
        }
    }

    info(message: string, metadata?: Record<string, unknown>) {
        this.log('info', message, metadata);
    }

    warn(message: string, metadata?: Record<string, unknown>) {
        this.log('warn', message, metadata);
    }

    error(message: string, metadata?: Record<string, unknown>) {
        this.log('error', message, metadata);
    }
}

export const logger = new Logger();
