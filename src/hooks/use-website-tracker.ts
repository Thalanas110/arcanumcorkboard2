import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useWebsiteTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackVisit = async () => {
            try {
                await supabase.from('website_visits').insert({
                    path: location.pathname,
                    user_agent: navigator.userAgent,
                    // IP address is typically handled by the server/database or edge functions,
                    // but we can try to client-side capture if needed, though often blocked or unreliable.
                    // For now, we'll rely on the backend (Supabase) if we were using Edge Functions, 
                    // or just accept it might be null/empty in this simple client-side tracking.
                });
            } catch (error) {
                console.error('Error tracking visit:', error);
            }
        };

        trackVisit();
    }, [location.pathname]);
};
