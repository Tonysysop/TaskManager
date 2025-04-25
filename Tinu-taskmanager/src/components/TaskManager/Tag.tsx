import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming cn is in lib/utils (common in shadcn)

interface TagProps {
  tagName: string;
  selectTag: (tag: string) => void;
  selected: boolean;
  className?: string; // Optional className prop
}

// Base background/text colors for selected tags
const tagColorMap: Record<string, string> = {
  Personal: "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700",
  School: "bg-cyan-700 hover:bg-cyan-800 text-white dark:bg-cyan-700 dark:hover:bg-cyan-800",
  Household: "bg-yellow-500 hover:bg-yellow-600 text-black dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:text-black",
  Others: "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700",
};

// Fallback color if tagName not in map or when not selected (using default Button outline)
const defaultUnselectedClasses = ""; // Rely on variant="outline"
const defaultSelectedClasses = "bg-muted text-foreground"; // A subtle default selection if tag name isn't matched

const Tag: React.FC<TagProps> = ({
  tagName,
  selectTag,
  selected,
  className, // Destructure className from props
}) => {
  // Determine the specific classes based on selection and tagName
  const stateSpecificClasses = selected
    ? tagColorMap[tagName] || defaultSelectedClasses
    : defaultUnselectedClasses;

  return (
    <Button
      variant="outline" // Base variant
      size="sm"        // Base size
      type="button"
      onClick={() => selectTag(tagName)}
      // Use cn to merge classes: base, state-specific, conditional, and external
      className={cn(
        // Base styles applied regardless of state (beyond variant/size)
        "rounded-md px-2 py-0.5 mr-1 mb-2 cursor-pointer", // Basic layout & spacing
        "transition-all duration-200 ease-in-out", // Smooth transitions

        // Apply classes based on selection state and tag name
        stateSpecificClasses,

        // Apply additional effects only when selected
        {
          //"ring-2 ring-primary ring-offset-1 ring-offset-background": selected, // More accessible focus/selected ring
          "shadow-[0_0_8px_rgba(168,85,247,0.6)] hover:scale-[1.03]": selected, // Original shadow - keep if preferred
        },

        // Override default focus styles if needed (Button variant might handle this well)
        "focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Standard focus-visible pattern

        // **Apply any external classes passed in via props**
        // `tailwind-merge` within `cn` will handle potential conflicts gracefully.
        className
      )}
    >
      {tagName}
    </Button>
  );
};

export default Tag;