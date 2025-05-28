import PomodoroTimer from "@/components/TaskManager_V2/Pomodoro/PomoTimer";

const PomodoroTimerPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br p-4 relative">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
        Pomodoro Timer
      </h1>
      <h3 className="text-base sm:text-lg mb-2 text-center font-medium px-2">
        Stay focused and build your streak!
      </h3>
      <p className="text-xs sm:text-sm mb-8 text-center px-2">
        Using the Pomodoro Technique to boost productivity
      </p>
      <PomodoroTimer />
    </div>
  );
};

export default PomodoroTimerPage;