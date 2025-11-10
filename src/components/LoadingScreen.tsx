import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

interface LoadingScreenProps {
  onComplete?: () => void;
  isLoading?: boolean; // New prop to control loading state from parent
}

export const LoadingScreen = ({ onComplete, isLoading = true }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      // Show indeterminate progress while actually loading
      interval = setInterval(() => {
        setProgress(prev => {
          // Use a sine wave for smooth, realistic loading animation
          const newProgress = 50 + Math.sin(Date.now() * 0.002) * 30;
          return Math.max(20, Math.min(80, newProgress)); // Keep between 20-80%
        });
      }, 50);
    } else {
      // Data is loaded, complete the progress bar
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Wait for the progress bar to visually complete before hiding
            setTimeout(() => {
              setIsVisible(false);
              onComplete?.();
            }, 600);
            return 100;
          }
          return prev + 3; // Quick completion
        });
      }, 20);
    }

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(-3px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-400 via-amber-500 to-red-500 flex items-center justify-center">
        {/* Clouds background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-16 bg-white/30 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-12 bg-white/25 rounded-full animate-float-delayed"></div>
          <div className="absolute top-60 left-1/4 w-28 h-14 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute bottom-40 right-1/4 w-20 h-10 bg-white/35 rounded-full animate-float-delayed"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center text-white">
          {/* Plane animation */}
          <div className="relative mb-8">
            <div 
              className="transform transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${(progress - 50) * 2}px) translateY(${-progress * 0.5}px) rotate(${progress * 0.2}deg)`,
              }}
            >
              <Plane 
                className="w-16 h-16 text-white drop-shadow-lg"
                style={{
                  filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.3))`,
                }}
              />
            </div>
            
            {/* Plane trail */}
            <div 
              className="absolute top-8 left-8 h-0.5 bg-white/60 rounded-full transition-all duration-300"
              style={{
                width: `${progress * 2}px`,
                opacity: progress > 20 ? 0.6 : 0,
              }}
            ></div>
          </div>

          {/* Loading text */}
          <h2 className="text-2xl font-bold mb-2 drop-shadow-md">
            Taking Off...
          </h2>
          <p className="text-orange-100 mb-8 drop-shadow-sm">
            Preparing your experience
          </p>

          {/* Progress bar */}
          <div className="w-80 max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-orange-100">Progress</span>
              <span className="text-sm font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/25 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-white to-orange-200 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </>
  );
};