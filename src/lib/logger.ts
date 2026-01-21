import { supabase } from '@/integrations/supabase/client';

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
    private async log(level: LogLevel, message: string, metadata: any = {}) {
        try {
            await supabase.from('system_logs').insert({
                level,
                message,
                metadata,
            });
        } catch (error) {
            console.error('Failed to send log to Supabase:', error);
        }
    }

    info(message: string, metadata?: any) {
        this.log('info', message, metadata);
    }

    warn(message: string, metadata?: any) {
        this.log('warn', message, metadata);
    }

    error(message: string, metadata?: any) {
        this.log('error', message, metadata);
    }
}

export const logger = new Logger();
