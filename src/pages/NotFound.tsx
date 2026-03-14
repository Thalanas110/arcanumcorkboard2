import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border border-border rounded-3xl shadow-lg p-8 md:p-12">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                <div className="relative bg-primary/10 rounded-full p-6">
                  <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div>
              <h1 className="text-7xl md:text-8xl font-bold text-primary mb-2">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
                Let's get you back on track.
              </p>
            </div>

            {/* Requested Path */}
            {location.pathname !== "/" && (
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground font-mono break-all">
                  <span className="font-semibold">Requested path:</span> {location.pathname}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need help? Visit the{" "}
            <button
              onClick={() => navigate("/admin")}
              className="text-primary hover:underline font-medium"
            >
              admin dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
