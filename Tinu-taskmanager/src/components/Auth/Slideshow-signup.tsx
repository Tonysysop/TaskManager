//import * as React from "react"
import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Slide {
  image: string;
  text: string;
}

interface SlideShowProps {
  slidesData: Slide[];
  className?: string; // Accepts a className prop for custom styling
}

export function SlideShow({ slidesData, className }: SlideShowProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 4000;

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    setHasMounted(true);
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    }, delay);
    return () => resetTimeout();
  }, [current, slidesData.length]); // Added slidesData.length as a dependency

  return (
    <div className={`w-full h-full flex flex-col m justify-between ${className}`}>
      <Carousel className="w-full h-full">
        <CarouselContent
          className="flex transition-transform duration-500 ease-in-out"
          style={hasMounted ? { transform: `translateX(-${current * 100}%)` } : {}}
        >
          {slidesData.map((slide, index) => (
            <CarouselItem key={index} className="h-full min-w-full">
              <div className="h-full w-full rounded-xl overflow-hidden flex flex-col p-4 md:p-6">
                  <img
                    loading="lazy"
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    className="rounded-lg w-full h-2/3 object-cover"
                  />
                  <span className="text-base text-center font-medium mt-0">
                    {slide.text}
                  </span>
                  {/* Loader is removed from here */}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Bottom progress bar loader - Moved outside the Carousel */}
      <div className="flex justify-center mt-2 space-x-2 w-full p-8"> {/* Added some padding for visibility */}
        {slidesData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="flex-1 h-2 rounded-full bg-muted relative overflow-hidden cursor-pointer"
          >
            <div
              className={`absolute left-0 top-0 h-full bg-primary ${
                idx === current ? "animate-fill" : ""
              }`}
              style={{
                animationDuration: `${delay}ms`,
                animationTimingFunction: "linear",
                // Reset width to 0 if not the current slide or if animation ended
                width: idx === current ? undefined : '0%',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}