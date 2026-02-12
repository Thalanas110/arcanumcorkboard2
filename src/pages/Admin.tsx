import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { logger } from "@/lib/logger";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        logger.info('Admin logged in', { userId });
      } else {
        logger.warn('Unauthorized admin access attempt', { userId });
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      logger.error('Error checking admin role', { error, userId });
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Explicitly remove the token from local storage to prevent persistence
      localStorage.removeItem('sb-lhiutjkmivobkpopwafb-auth-token');
      setSession(null);
      setIsAdmin(false);
      logger.info('User logged out manually');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <AdminLogin />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;