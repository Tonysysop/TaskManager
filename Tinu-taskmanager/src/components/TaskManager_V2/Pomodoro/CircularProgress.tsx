import React from "react";

interface CircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  colors: {
    primary: string;
    secondary: string;
    background: string; // This will now be dynamically set by the parent
  };
  darkMode: boolean; // Add a darkMode prop
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size,
  strokeWidth,
  colors,
  darkMode, // Destructure darkMode prop
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Define dynamic styles based on darkMode
  const containerStyles = {
    width: size,
    height: size,
    borderRadius: "50%",
    padding: "20px",
    boxShadow: darkMode
      ? `
        0 0 0 1px ${colors.primary}30,
        0 20px 25px -5px rgba(0, 0, 0, 0.3),
        0 10px 10px -5px rgba(0, 0, 0, 0.12),
        inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)
      ` // Dark mode shadows
      : `
        0 0 0 1px ${colors.primary}15,
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)
      `, // Light mode shadows
  };

  // Generate unique IDs for gradients to prevent conflicts if multiple components are rendered
  const gradientId = React.useMemo(
    () => `gradient-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  return (
    <div
      className="relative transition-all duration-500"
      style={containerStyles} // Apply dynamic styles
    >
      <svg
        className="transform -rotate-90 transition-transform duration-500"
        width={size - 40}
        height={size - 40}
      >
        {/* Background circle */}
        <circle
          cx={(size - 40) / 2}
          cy={(size - 40) / 2}
          r={radius}
          className={`transition-all duration-500 ${
            darkMode ? "stroke-gray-400" : "stroke-gray-700"
          }`}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <circle
          cx={(size - 40) / 2}
          cy={(size - 40) / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${colors.primary}40)`,
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {" "}
            {/* Use unique gradient ID */}
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
      </svg>

      {/* Glowing dot at progress end */}
      {progress > 0 && (
  <div
    className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse" // <--- Changes here
    style={{
      background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
      boxShadow: `0 0 12px ${colors.primary}80`,
      top: "50%",
      left: "50%",
      transform: `
        translate(-50%, -50%)
        rotate(${(progress / 100) * 360 - 90}deg)
        translateY(-${radius + 20}px)
      `,
      transformOrigin: "center",
    }}
  />
)}
    </div>
  );
};

export default CircularProgress;
