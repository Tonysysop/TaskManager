import React, { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedInputProps = {
  placeholders: string[];
  interval?: number;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(function AnimatedInput(
  { placeholders, interval = 3000, className, value, onFocus, onBlur, ...props },
  ref
) {
  const [index, setIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, interval);
    return () => clearInterval(timer);
  }, [placeholders, interval]);

  const isEmpty = !value || (typeof value === "string" && value.trim() === "");

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        {...props}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "peer relative z-10 bg-transparent text-base text-foreground caret-primary placeholder-transparent",
          "file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border px-3 py-2 shadow-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className
        )}
        placeholder=" "
      />

      {!isFocused && isEmpty && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
          <AnimatePresence mode="wait">
            <motion.span
              key={placeholders[index]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {placeholders[index]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});
