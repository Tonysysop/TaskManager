//import * as React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

interface Slide {
  image: string
  text: string
}

interface SlideShowProps {
  slidesData: Slide[]
  className?: string
}

export function SlideShow({ slidesData, className }: SlideShowProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const delay = 4000

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  useEffect(() => {
    setHasMounted(true)
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1))
    }, delay)
    return () => resetTimeout()
  }, [current])

  return (
    <div className={`w-full h-full flex flex-col justify-between ${className}`}>
      <Carousel className="w-full h-full">
        <CarouselContent
          className="flex transition-transform duration-500 ease-in-out"
          style={hasMounted ? { transform: `translateX(-${current * 100}%)` } : {}}
        >
          {slidesData.map((slide, index) => (
            <CarouselItem key={index} className="h-full min-w-full">
              <div className="h-full w-full rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow">
                <div className="flex flex-col justify-center items-center h-full space-y-4 p-6">
                  <img
                    loading="lazy"
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    className="rounded-lg w-full h-2/3 object-cover"
                  />
                  <span className="text-base text-center font-medium">
                    {slide.text}
                  </span>

                  {/* Bottom progress bar loader */}
                  <div className="flex justify-center mt-8 space-x-2 w-full">
                    {slidesData.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className="flex-1 h-2 rounded-full bg-muted relative overflow-hidden"
                      >
                        <div
                          className={`absolute left-0 top-0 h-full bg-primary ${
                            idx === current ? "animate-fill" : ""
                          }`}
                          style={{
                            animationDuration: `${delay}ms`,
                            animationTimingFunction: "linear",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
