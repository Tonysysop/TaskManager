import React from "react";
import TaskCard from "@/components/TaskManager/TaskCard"; // Make sure path is correct
import DropArea from "@/components/DropArea";
import { LucideIcon } from "lucide-react";
import { TaskAttributes } from "@/types/TaskAttributes";



interface TaskColumnProps {
  shadowColor: string;
  bgColor: string;
  icon: LucideIcon; // Assuming `icon` is a React component
  columnName: string;
  tasks: TaskAttributes[];
  // --- Updated prop types ---
  handleDelete: (taskToDelete: TaskAttributes) => void;
  setActiveCard: (task: TaskAttributes | null) => void;
  onDrop: (status: string, position: number) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  icon: Icon,
  columnName,
  tasks = [],
  handleDelete,
  setActiveCard,
  onDrop,
  shadowColor,
  bgColor,
}) => {
  return (
    <div className={`flex-1 min-w-[300px] bg-card rounded-lg shadow-lg ${shadowColor} p-4`}>
      <div className={`flex items-center gap-2 mb-4 p-2 rounded-md ${bgColor}`}>
        <Icon size={20} />
        <h2 className="font-semibold">{columnName}</h2>
        <span className="ml-auto bg-background rounded-full w-6 h-6 flex items-center justify-center text-sm">
          {tasks.length}
        </span>
      </div>

      {/* Drop area at the top of the column (position 0) */}
      <DropArea onDrop={() => onDrop(columnName, 0)} />

      {/* Render tasks and drop areas between them */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            <TaskCard
              task={task}
              handleDelete={handleDelete}
              setActiveCard={setActiveCard}
              columnType={columnName.toLowerCase()}
            />
            <DropArea onDrop={() => onDrop(columnName, index + 1)} />
          </React.Fragment>
        ))}
      </div>

      {/* Placeholder for empty columns */}
      {tasks.length === 0 && <p className="text-gray-500 text-center py-4">No tasks yet</p>}
    </div>
  );
};

export default TaskColumn;
