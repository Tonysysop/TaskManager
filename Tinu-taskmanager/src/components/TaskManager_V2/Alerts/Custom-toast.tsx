import { toast } from "sonner";
import {
  CheckIcon,         // Changed from CheckCircle
  InfoIcon,          // Changed from Info
  AlertTriangleIcon, // Changed from AlertTriangle
  XIcon,             // Changed from XCircle
} from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface CustomToastProps {
  variant: ToastVariant;
  description: string;
  duration?: number;
}

const variantConfig = {
  success: {
    IconComponent: CheckIcon, 
    iconSymbolContainerBg: "bg-green-500", 
    border: "border-green-400", 
    bg: "bg-green-50",          
    titleColor: "text-gray-800",  
    title: "Success!",
  },
  error: {
    IconComponent: XIcon,
    iconSymbolContainerBg: "bg-red-500",
    border: "border-red-400",
    bg: "bg-red-50",
    titleColor: "text-gray-800",
    title: "Something went wrong",
  },
  warning: {
    IconComponent: AlertTriangleIcon, 
    iconSymbolContainerBg: "bg-amber-500",
    border: "border-amber-400", 
    bg: "bg-yellow-50",
    titleColor: "text-gray-800",
    title: "Warning!                  ",
  },
  info: {
    IconComponent: InfoIcon,
    iconSymbolContainerBg: "bg-blue-500",
    border: "border-blue-400",
    bg: "bg-blue-50",
    titleColor: "text-gray-800",
    title: "Did you know?",
  },
};

function ToastContent({
  variant,
  description,
}: CustomToastProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={`w-full max-w-md rounded-xl border ${config.border} ${config.bg} p-4 flex items-start shadow-lg`}
    >
      <div className="flex items-start gap-3"> 
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.iconSymbolContainerBg}`}
        >
          <config.IconComponent className="text-white" size={20} strokeWidth={2.5} /> 
        </div>

        {/* Text Section */}
        <div>
          <p className={`font-semibold ${config.titleColor}`}>{config.title}</p>
          <p className="text-sm text-gray-700 d mt-0.5"> 
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomToast({
  variant,
  description,
  duration = 5000,
}: CustomToastProps) {
  toast.custom(
    () => (
      <ToastContent variant={variant} description={description} />
    ),
    {
      duration,
    }
  );
}

