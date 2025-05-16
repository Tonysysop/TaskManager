import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const PomodoroTimer = () => {
	const [mode, setMode] = useState<TimerMode>("focus");
	const [isActive, setIsActive] = useState(false);
	const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
	const [completedSessions, setCompletedSessions] = useState(0);

	// Define time durations for different modes (in seconds)
	const durations = {
		focus: 25 * 60,
		shortBreak: 5 * 60,
		longBreak: 15 * 60,
	};

	// Calculate progress percentage
	const getProgressPercentage = () => {
		return ((durations[mode] - timeLeft) / durations[mode]) * 100;
	};

	// Format time as MM:SS
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	// Handle timer mode change
	const switchMode = (newMode: TimerMode) => {
		setIsActive(false);
		setMode(newMode);
		setTimeLeft(durations[newMode]);
	};

	// Reset the current timer
	const resetTimer = () => {
		setIsActive(false);
		setTimeLeft(durations[mode]);
		toast.info("Timer reset");
	};

	// Toggle timer active state
	const toggleTimer = () => {
		setIsActive(!isActive);

		if (!isActive && timeLeft === durations[mode]) {
			toast.success(`${mode === "focus" ? "Focus" : "Break"} session started!`);
		}
	};

	// Timer effect
	useEffect(() => {
		let interval: number | undefined;

		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000) as unknown as number;
		} else if (isActive && timeLeft === 0) {
			setIsActive(false);

			// Handle session completion
			if (mode === "focus") {
				const newCompletedSessions = completedSessions + 1;
				setCompletedSessions(newCompletedSessions);

				toast.success("Focus session completed! Take a break.", {
					duration: 5000,
				});

				// After 4 focus sessions, take a long break
				if (newCompletedSessions % 4 === 0) {
					switchMode("longBreak");
				} else {
					switchMode("shortBreak");
				}
			} else {
				toast.success("Break time over! Ready to focus?", {
					duration: 5000,
				});
				switchMode("focus");
			}
		}

		return () => clearInterval(interval);
	}, [isActive, timeLeft, mode, completedSessions]);

	return (
		<div className="w-full max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
			<div className="flex items-center justify-center gap-2 mb-6">
				<Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
				<h2 className="text-2xl font-medium text-gray-800 dark:text-white">
					Pomodoro Timer
				</h2>
			</div>

			<div className="flex justify-between gap-2 mb-8">
				<Button
					variant={mode === "focus" ? "default" : "outline"}
					onClick={() => switchMode("focus")}
					className={`flex-1 ${
						mode === "focus" ? "bg-blue-600 hover:bg-blue-700" : ""
					}`}
					disabled={isActive}
				>
					Focus
				</Button>
				<Button
					variant={mode === "shortBreak" ? "default" : "outline"}
					onClick={() => switchMode("shortBreak")}
					className={`flex-1 ${
						mode === "shortBreak" ? "bg-blue-600 hover:bg-blue-700" : ""
					}`}
					disabled={isActive}
				>
					Short Break
				</Button>
				<Button
					variant={mode === "longBreak" ? "default" : "outline"}
					onClick={() => switchMode("longBreak")}
					className={`flex-1 ${
						mode === "longBreak" ? "bg-blue-600 hover:bg-blue-700" : ""
					}`}
					disabled={isActive}
				>
					Long Break
				</Button>
			</div>

			<div className="text-center mb-8">
				<div className="text-6xl font-light mb-4 text-gray-800 dark:text-white">
					{formatTime(timeLeft)}
				</div>
				<Progress
					value={getProgressPercentage()}
					className="h-2 bg-gray-200 dark:bg-gray-700"
				/>
			</div>

			<div className="flex justify-center gap-4">
				<Button
					onClick={toggleTimer}
					className={`bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25 dark:shadow-blue-400/20 transition-all duration-300 transform hover:scale-105 w-40 ${
						isActive ? "bg-blue-700" : ""
					}`}
				>
					{isActive ? (
						<>
							<Pause className="mr-2 h-5 w-5" /> Pause
						</>
					) : (
						<>
							<Play className="mr-2 h-5 w-5" /> Start
						</>
					)}
				</Button>
				<Button
					onClick={resetTimer}
					variant="outline"
					className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
					disabled={timeLeft === durations[mode] && !isActive}
				>
					<RotateCcw className="h-5 w-5" />
				</Button>
			</div>

			{completedSessions > 0 && (
				<div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
					<p>
						Completed sessions today:{" "}
						<span className="font-medium text-gray-800 dark:text-gray-200">
							{completedSessions}
						</span>
					</p>
				</div>
			)}
		</div>
	);
};

export default PomodoroTimer;
