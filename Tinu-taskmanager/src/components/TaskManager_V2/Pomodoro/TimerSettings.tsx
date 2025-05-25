import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check, Timer, Clock } from "lucide-react";

interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  setFocusTime: (time: number) => void;
  setShortBreakTime: (time: number) => void;
  setLongBreakTime: (time: number) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  isOpen,
  onClose,
  focusTime,
  shortBreakTime,
  longBreakTime,
  setFocusTime,
  setShortBreakTime,
  setLongBreakTime,
}) => {
  const [localFocusTime, setLocalFocusTime] = React.useState(focusTime);
  const [localShortBreakTime, setLocalShortBreakTime] =
    React.useState(shortBreakTime);
  const [localLongBreakTime, setLocalLongBreakTime] =
    React.useState(longBreakTime);

  React.useEffect(() => {
    if (isOpen) {
      setLocalFocusTime(focusTime);
      setLocalShortBreakTime(shortBreakTime);
      setLocalLongBreakTime(longBreakTime);
    }
  }, [isOpen, focusTime, shortBreakTime, longBreakTime]);

  const handleSave = () => {
    setFocusTime(localFocusTime);
    setShortBreakTime(localShortBreakTime);
    setLongBreakTime(localLongBreakTime);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="border-0 shadow-lg">
        <SheetHeader className="mb-2">
          <SheetTitle className="text-2xl font-bold">Timer Settings</SheetTitle>
          <SheetDescription>
            Customize your focus and break times.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Focus Time */}
          {/* Changed border classes to use theme-aware 'border-border' */}
          <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Timer
                  size={18}
                  className="text-indigo-500 dark:text-indigo-400 mr-2"
                />
                Focus Time
              </Label>
              <span className="text-sm font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                {localFocusTime} min
              </span>
            </div>
            <Slider
              value={[localFocusTime]}
              min={1}
              max={60}
              step={1}
              onValueChange={(value) => setLocalFocusTime(value[0])}
              className="mt-2"
            />
          </div>

          {/* Short Break */}
          {/* Changed border classes to use theme-aware 'border-border' */}
          <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Clock
                  size={18}
                  className="text-emerald-500 dark:text-emerald-400 mr-2"
                />
                Short Break
              </Label>
              <span className="text-sm font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                {localShortBreakTime} min
              </span>
            </div>
            <Slider
              value={[localShortBreakTime]}
              min={1}
              max={15}
              step={1}
              onValueChange={(value) => setLocalShortBreakTime(value[0])}
              className="mt-2"
            />
          </div>

          {/* Long Break */}
          {/* Changed border classes to use theme-aware 'border-border' */}
          <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Clock
                  size={18}
                  className="text-blue-500 dark:text-blue-400 mr-2"
                />
                Long Break
              </Label>
              <span className="text-sm font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full">
                {localLongBreakTime} min
              </span>
            </div>
            <Slider
              value={[localLongBreakTime]}
              min={5}
              max={30}
              step={1}
              onValueChange={(value) => setLocalLongBreakTime(value[0])}
              className="mt-2"
            />
          </div>
        </div>

        <SheetFooter className="mt-4">
          <Button
            className="w-full shadow-md hover:shadow-lg transition-all duration-300"
            onClick={handleSave}
          >
            <Check className="mr-2" /> Save Settings
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TimerSettings;
