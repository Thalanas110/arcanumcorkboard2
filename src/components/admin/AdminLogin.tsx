import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, ArrowLeft } from "lucide-react";

export const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/admin`;
      
      if (isSignup) {
        // Sign up
        /*
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) throw error;
        
        if (data.user) {
          toast.success('Account created! You can now log in.');
          setIsSignup(false);
        }*/
       console.log('Signup is currently disabled.');
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignup ? 'Create Admin Account' : 'Admin Login'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignup 
              ? 'Create your admin account to manage the corkboard'
              : 'Enter your credentials to access the admin dashboard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  isSignup ? 'Creating account...' : 'Logging in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isSignup ? 'Sign Up' : 'Login'}
                  </>
                )}
              </Button>
              
              {/*
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsSignup(!isSignup)}
                disabled={loading}
              >
                {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
              </Button>
              */}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/'}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Corkboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};