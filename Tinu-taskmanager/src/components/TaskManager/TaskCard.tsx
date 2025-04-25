
import React from "react";
import Tag from "@/components/TaskManager/Tag"; // Assuming Tag component path is correct
import { Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from "../ui/button";



// Define or import the Task type
interface Task {
  task: string;
  status: string;
  tags: string[];
  date: string;
  // Consider adding a unique ID: id?: string | number;
}

// --- Updated Prop Types ---
interface TaskCardProps {
  task: Task; // Keep the task object
  handleDelete: (taskToDelete: Task) => void; // Expects the task object
  setActiveCard: (task: Task | null) => void; // Expects the task object or null
  // index prop is no longer needed for drag/delete, keep if used for keys or other logic
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  handleDelete,
  setActiveCard,
  //index, // Keep index if needed for the key in TaskColumn or other reasons
}) => {
  const handleDragStart = () => {
    // Set the actual task object as active
    setActiveCard(task);
    // Optional: You might want to set drag effect or dataTransfer here
    // e.dataTransfer.effectAllowed = "move";
    // e.dataTransfer.setData("text/plain", task.id || JSON.stringify(task)); // Use ID or stringify task if needed
  };

  const handleDragEnd = () => {
    // Clear active card when drag ends
    setActiveCard(null);
  };
  format(new Date(task.date), 'PPPpp')
  const createdAt = task.date ? new Date(task.date) : new Date();
  const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true });
  const exactTime = createdAt.toLocaleString(); // Example: 4/19/2025, 11:25 AM

  return (
    <article
      className="w-full min-h-[100px] border border-border rounded-lg p-2 
                bg-[var(--color-card)] text-[var(--color-card-foreground)] 
                shadow-[0_0_8px_rgba(168,85,247,0.6)] dark:shadow-[0_0_8px_rgba(168,85,247,0.6)]
                hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
              hover:border-purple-400 dark:hover:border-purple-300
                hover:ring-2 hover:ring-purple-200 dark:hover:ring-purple-500/30
                transform transition-all duration-300 hover:-translate-y-1
                active:opacity-40 active:border active:border-gray-900 
                cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
>

      <p className="text-lg font-semibold mb-2">{task.task}</p>
      <div className="flex items-center justify-between">

        <div>

          {task.tags.map(
            (
              tag,
              tagIndex // Use different index variable 'tagIndex'
            ) => (
              <Tag
                className="h-7 px-1.5 text-xs"
                key={tagIndex} // Use tagIndex for key here
                tagName={tag}
                // Assuming selectTag and selected are handled correctly by Tag component
                selectTag={() => {}}
                selected={true}
              />
            )
          )}
          {/* Date Section */}
          <p
            title={new Date(task.date).toLocaleString()} 
            className="text-left text-xs font-medium 
              bg-gray-100 border border-gray-300 
              dark:bg-gray-800 dark:border-gray-600 
              rounded-md px-2 w-fit
            "
          >

            {exactTime} ({relativeTime})
          </p>
        </div>

        <div
          className="group w-[35px] h-[35px] rounded-full flex items-center justify-center cursor-pointer mb-2.5 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700"
          
        >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(task)}
          className="text-gray-700 font-bold hover:text-red-500 opacity-80 group-hover:opacity-100 transition-opacity"

        >
          <Trash2 className="h-4 w-4" />

        </Button>
        </div>
      </div>
    </article>
    
  );
};

export default TaskCard;






