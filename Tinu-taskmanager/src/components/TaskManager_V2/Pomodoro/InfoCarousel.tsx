import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Timer, Target, Clock } from "lucide-react";

const InfoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <Timer className="w-8 h-8 text-pink-500" />,
      title: "What is a Pomodoro Timer?",
      content:
        "A time management technique using 25-minute focused work intervals followed by short breaks to boost productivity and maintain focus throughout your day.",
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: "How to Use",
      content:
        "Choose a task, start the timer, work for 25 minutes with complete focus, then take a 5-minute break. Repeat this cycle 4 times, then take a longer 15-30 minute break.",
    },
    {
      icon: <Target className="w-8 h-8 text-indigo-500" />,
      title: "The Goal",
      content:
        "Maintain deep focus, reduce distractions, and create a sustainable rhythm of productivity. Build momentum through consistent work sessions and regular breaks.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 50000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    // Increased height from h-48 to h-60
    <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg overflow-hidden">
      <div className="relative h-60 flex items-center justify-center px-8 py-6">
        {" "}
        {/* <-- Increased height here */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 transform translate-x-0"
                : index < currentSlide
                ? "opacity-0 transform -translate-x-full"
                : "opacity-0 transform translate-x-full"
            }`}
          >
            <div className="text-center max-w-md">
              <div className="flex justify-center mb-4">{slide.icon}</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-lg">
                {slide.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {slide.content}
              </p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {" "}
          {/* Added z-10 just in case, though likely not needed */}
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 w-8"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default InfoCarousel;