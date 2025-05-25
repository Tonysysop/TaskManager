import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast";
import {
  Play,
  Pause,
  RotateCcw,
  ZapOff,
  Zap,
  Check,
  Settings,
  TrendingUp,
  Flame,
  Target,
} from "lucide-react";
import TimerSettings from "@/components/TaskManager_V2/Pomodoro/TimerSettings";
import InfoCarousel from "@/components/TaskManager_V2/Pomodoro/InfoCarousel";
import CircularProgress from "@/components/TaskManager_V2/Pomodoro/CircularProgress";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Timer types
type TimerState = "focus" | "shortBreak" | "longBreak";
type TimerStatus = "idle" | "running" | "paused";

const PomodoroTimer = () => {
  // Timer settings (in minutes)
  const [focusTime, setFocusTime] = useState<number>(25);
  const [shortBreakTime, setShortBreakTime] = useState<number>(5);
  const [longBreakTime, setLongBreakTime] = useState<number>(15);
  
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>("focus");
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(focusTime * 60);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  
  // Streak tracking
  const [currentStreak, setCurrentStreak] = useLocalStorage("pomodoroStreak", 0);
  const [totalCompleted, setTotalCompleted] = useLocalStorage("pomodoroTotalCompleted", 0);
  const [focusSessionsCount, setFocusSessionsCount] = useState<number>(0);
  
  // Ref for interval
  const timerInterval = useRef<number | null>(null);
  
  // // Screen effects based on timer state
  // const isFocusRunning = timerState === "focus" && timerStatus === "running";
  
  // // Apply grayscale to body when focus is running
  // useEffect(() => {
  //   if (isFocusRunning) {
  //     document.body.style.filter = "grayscale(100%)";
  //     document.body.style.transition = "filter 0.5s ease-in-out";
  //   } else {
  //     document.body.style.filter = "none";
  //   }
    
  //   return () => {
  //     document.body.style.filter = "none";
  //   };
  // }, [isFocusRunning]);

  // Initialize timeLeft when settings change
  useEffect(() => {
    if (timerStatus === "idle") {
      switch (timerState) {
        case "focus":
          setTimeLeft(focusTime * 60);
          break;
        case "shortBreak":
          setTimeLeft(shortBreakTime * 60);
          break;
        case "longBreak":
          setTimeLeft(longBreakTime * 60);
          break;
      }
    }
  }, [focusTime, shortBreakTime, longBreakTime, timerState, timerStatus]);
  
  useEffect(() => {
    if (timerStatus === "running") {
      timerInterval.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerStatus]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
    
    if (timerState === "focus") {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 1000);
    }
    
    if (timerState === "focus") {
      const newCompleted = totalCompleted + 1;
      const newStreak = currentStreak + 1;
      setTotalCompleted(newCompleted);
      setCurrentStreak(newStreak);
      setFocusSessionsCount(prev => prev + 1);
      CustomToast({variant:"success", description:`Streak: ${newStreak} | Total completed: ${newCompleted}`, duration:4000})
      
      if (focusSessionsCount >= 3) {
        setTimerState("longBreak");
        setFocusSessionsCount(0);
      } else {
        setTimerState("shortBreak");
      }
    } else {
      setTimerState("focus");
    }
    
    setTimerStatus("idle");
  };
  
  const startTimer = () => {
    setTimerStatus("running");
  };
  
  const pauseTimer = () => {
    setTimerStatus("paused");
  };
  
  const resetTimer = () => {
    setTimerStatus("idle");
    switch (timerState) {
      case "focus":
        setTimeLeft(focusTime * 60);
        break;
      case "shortBreak":
        setTimeLeft(shortBreakTime * 60);
        break;
      case "longBreak":
        setTimeLeft(longBreakTime * 60);
        break;
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const calculateProgress = (): number => {
    let totalTime;
    switch (timerState) {
      case "focus":
        totalTime = focusTime * 60;
        break;
      case "shortBreak":
        totalTime = shortBreakTime * 60;
        break;
      case "longBreak":
        totalTime = longBreakTime * 60;
        break;
      default:
        totalTime = focusTime * 60;
    }
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };
  
  const getTimerColor = (): string => {
    switch (timerState) {
      case "focus":
        return "bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600"; 
      case "shortBreak":
        return "bg-gradient-to-br from-emerald-400 via-sky-500 to-violet-600";
      case "longBreak":
        return "bg-gradient-to-br from-blue-500 via-indigo-700 to-purple-800"; 
    }
  };

  const getTimerColors = () => {
    switch (timerState) {
      case "focus":
        return {
          primary: "#ec4899",
          secondary: "#a855f7",
          background: "#fdf2f8"
        };
      case "shortBreak":
        return {
          primary: "#06b6d4",
          secondary: "#10b981",
          background: "#f0fdfa"
        };
      case "longBreak":
        return {
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          background: "#eff6ff"
        };
    }
  };
  
  const getTimerLabel = (): string => {
    switch (timerState) {
      case "focus":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  const getTimerIcon = () => {
    switch (timerState) {
      case "focus":
        return <Zap className="w-5 h-5 animate-pulse" />;
      case "shortBreak":
        return <ZapOff className="w-5 h-5" />;
      case "longBreak":
        return <ZapOff className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="w-full max-w-4xl space-y-8 relative">
      {/* Flash overlay */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 animate-pulse pointer-events-none z-50" />
      )}
      
      <Card className="shadow-xl border-0 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:shadow-3xl group rounded-lg">
        <CardHeader className={`${getTimerColor()}  transition-all duration-400 relative overflow-hidden py-8`}>
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <CardTitle className="text-2xl font-bold tracking-tight bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
                Pomodoro Timer
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg transition-all duration-300 hover:bg-white/30 hover:scale-105">
                  <Flame size={20} className="animate-pulse text-orange-200" />
                  <span className="text-lg font-bold">
                    {currentStreak}
                  </span>
                  <span className="text-xs opacity-80">streak</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg transition-all duration-300 hover:bg-white/30 hover:scale-105">
                  <Target size={20} className="text-green-200" />
                  <span className="text-lg font-bold">
                    {totalCompleted}
                  </span>
                  <span className="text-xs opacity-80">total</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button 
                variant={timerState === "focus" ? "default" : "ghost"}
                size="sm"
                className={`transition-all duration-300 text-sm font-semibold px-8 py-3 rounded-lg ${
                  timerState === "focus" 
                    ? "bg-white/30 text-white shadow-lg scale-110 border-2 border-white/40" 
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105"
                }`}
                onClick={() => {
                  if (timerStatus === "idle") {
                    setTimerState("focus");
                    setTimeLeft(focusTime * 60);
                  }
                }}
              >
                Focus
              </Button>
              <Button 
                variant={timerState === "shortBreak" ? "default" : "ghost"}
                size="sm"
                className={`transition-all duration-300 text-sm font-semibold px-8 py-3 rounded-lg ${
                  timerState === "shortBreak" 
                    ? "bg-white/30 text-white shadow-lg scale-110 border-2 border-white/40" 
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105"
                }`}
                onClick={() => {
                  if (timerStatus === "idle") {
                    setTimerState("shortBreak");
                    setTimeLeft(shortBreakTime * 60);
                  }
                }}
              >
                Short Break
              </Button>
              <Button 
                variant={timerState === "longBreak" ? "default" : "ghost"}
                size="sm"
                className={`transition-all duration-300 text-sm font-semibold px-8 py-3 rounded-lg ${
                  timerState === "longBreak" 
                    ? "bg-white/30 text-white shadow-lg scale-110 border-2 border-white/40" 
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105"
                }`}
                onClick={() => {
                  if (timerStatus === "idle") {
                    setTimerState("longBreak");
                    setTimeLeft(longBreakTime * 60);
                  }
                }}
              >
                Long Break
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-8 px-8 bg-white dark:bg-gray-800 transition-colors duration-500">
          <div className="flex items-center justify-between gap-6">
            {/* Compact Stats Column */}
            <div className="flex flex-col space-y-3 w-28">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg p-3 shadow-sm border border-emerald-100 dark:border-emerald-700/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="p-1 bg-emerald-500 rounded-md">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Done</span>
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalCompleted}</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-3 shadow-sm border border-orange-100 dark:border-orange-700/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1 bg-orange-500 rounded-md">
                    <Flame className="w-2 h-2" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Streak</span>
                </div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{currentStreak}</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3 shadow-sm border border-blue-100 dark:border-blue-700/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1 bg-blue-500 rounded-md">
                    <TrendingUp className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Focus</span>
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{focusTime}</div>
              </div>
            </div>
            
            {/* Enlarged Timer Section */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative group mb-6">
                <CircularProgress 
                  darkMode
                  progress={calculateProgress()}
                  size={350}
                  strokeWidth={8}
                  colors={getTimerColors()}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-center mb-4 text-gray-500 dark:text-gray-400 bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full px-5 py-3 shadow-sm">
                    {getTimerIcon()}
                    <span className="text-sm font-semibold ml-2 tracking-wide">{getTimerLabel()}</span>
                  </div>
                  <div className="text-7xl font-bold text-gray-600 dark:text-gray-100 tracking-tight transition-all duration-300 hover:scale-105">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="mt-4 text-sm text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase">
                    {timerStatus === "running" ? "In Progress" : timerStatus === "paused" ? "Paused" : "Ready"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right spacer for balance */}
            <div className="w-28"></div>
          </div>
          
          {/* Controls at Bottom */}
          <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            {timerStatus === "running" ? (
              <Button 
                variant="outline" 
                onClick={pauseTimer}
                className="border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700 hover:scale-105 px-8 py-3 text-base font-semibold rounded-lg"
              >
                <Pause className="mr-2 w-5 h-5" /> Pause
              </Button>
            ) : (
              <Button 
                onClick={startTimer}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:scale-105 border-0 px-8 py-3 text-base font-semibold rounded-lg cursor-pointer"
              >
                <Play className="mr-2 w-5 h-5" /> {timerStatus === "paused" ? "Resume" : "Start"}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={resetTimer}
              className="border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-700 hover:scale-105 px-8 py-3 text-base font-semibold rounded-lg cursor-pointer"
            >
              <RotateCcw size={18} className="mr-2" /> Reset
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 px-6 py-3 rounded-lg font-medium cursor-pointer"
            >
              <Settings className="mr-2 w-4 h-4" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="w-full">
        <Separator className="mb-8 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
        <InfoCarousel />
      </div>
      
      <TimerSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        focusTime={focusTime}
        shortBreakTime={shortBreakTime}
        longBreakTime={longBreakTime}
        setFocusTime={setFocusTime}
        setShortBreakTime={setShortBreakTime}
        setLongBreakTime={setLongBreakTime}
      />
    </div>
  );
};

export default PomodoroTimer;