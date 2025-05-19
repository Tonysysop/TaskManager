import { Check } from "lucide-react";
import { useEffect } from "react";

interface SuccessAnimationProps {
  onAnimationComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  onAnimationComplete 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3000); // Increased to match full animation sequence

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-12">
      <div className="relative flex items-center justify-center h-40 w-40">
        {/* Pulsing Rings */}
        <div className="feedback-success-ring bg-green-300/30 animate-pulse-ring"></div>
        <div className="feedback-success-ring bg-green-400/30 animate-pulse-ring animate-delay-300"></div>
        <div className="feedback-success-ring bg-green-500/30 animate-pulse-ring animate-delay-600"></div>
        
        {/* Checkmark Container */}
        <div className="absolute h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center z-10 animate-scale-up">
          <div className="h-16 w-16 rounded-full bg-green-200 dark:bg-green-800/40 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Text Content */}
      <div className="mt-8 text-center animate-fade-in animate-delay-500">
        <h2 className="text-xl font-semibold">
          Feedback Submitted!
        </h2>
        <p className="mt-2 text-muted-foreground max-w-xs">
          Thank you for your valuable input. We'll review it shortly.
        </p>
      </div>
    </div>
  );
};

export default SuccessAnimation;