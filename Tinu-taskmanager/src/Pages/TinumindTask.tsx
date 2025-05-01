
import TinuMind from '@/components/TaskManager_V2/Taskmanager';

const TinuMindPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Task Management
          </h1>
          <p className="mt-3 text-xl text-muted-foreground">
            A modern Kanban board for efficient project management
          </p>
        </div>
        <TinuMind />
      </div>
    </div>
  );
};

export default TinuMindPage;
