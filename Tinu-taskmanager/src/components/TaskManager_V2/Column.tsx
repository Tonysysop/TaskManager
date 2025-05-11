// ./Column.tsx (Updated: Removed horizontal scroll, improved drop zones)
import DropArea from "@/components/DropArea2";
import { LucideIcon } from 'lucide-react';
import TaskCard from '@/components/TaskManager_V2/Taskcard';
import { TaskAttributes } from '@/types/TaskAttributes';
import React, { useState } from "react";
import { motion } from "framer-motion";

interface ColumnProps {
  title: string;
  icon: LucideIcon;
  statusValue: TaskAttributes['status'];
  tasks: TaskAttributes[];
  bgColor: string;
  shadowColor: string;
  onDeleteTask: (taskId: string) => void;
  setActiveCard: (task: TaskAttributes | null) => void;
  onDrop: (taskId: string, targetStatusValue: TaskAttributes['status'], targetPosition: number) => void;
  activeCard: TaskAttributes | null;
  onClickTask: (task: TaskAttributes) => void; // Ensure this prop is defined
}

const Column: React.FC<ColumnProps> = ({
  title,
  icon: Icon,
  statusValue,
  tasks,
  bgColor,
  shadowColor,
  onDeleteTask,
  setActiveCard,
  onDrop,
  activeCard,
  onClickTask
}) => {
  const [colOver, setColOver] = useState(false);

  const handleDropInColumn = (droppedTaskId: string, positionInColumn: number) => {
    setColOver(false);
    onDrop(droppedTaskId, statusValue, positionInColumn);
  };

  const handleColDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setColOver(true); };
  const handleColDragLeave = () => setColOver(false);
  const handleColDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setColOver(false); };

  return (
    <div className={`flex flex-col flex-1 min-w-[300px] max-w-[400px] bg-card rounded-lg shadow-lg ${shadowColor} p-4`}>      
      <div className={`flex items-center gap-2 mb-4 p-2 rounded-md ${bgColor}`}>
        <Icon size={20} />
        <h2 className="font-semibold">{title}</h2>
        <span className="ml-auto bg-background rounded-full w-6 h-6 flex items-center justify-center text-sm">
          {tasks.length}
        </span>
      </div>

      <div
        onDragOver={handleColDragOver}
        onDragEnter={handleColDragOver}
        onDragLeave={handleColDragLeave}
        onDrop={handleColDrop}
        className={`overflow-y-auto overflow-x-hidden space-y-1 max-h-[calc(100vh-220px)] custom-scrollbar pr-1 transition-colors ${
        colOver ? 'bg-violet-400/20' : ''
        }`}
      >
        {/* Top Drop Zone */}
        <div className="">
          <DropArea onDrop={(taskId) => handleDropInColumn(taskId, 0)} />
        </div>

        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground p-4 min-h-[50px]">
            No tasks yet.
          </div>
        ) : (
          tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <motion.div
                layoutId={task.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <TaskCard
                  task={task}
                  onDelete={() => onDeleteTask(task.id)}
                  columnType={statusValue}
                  setActiveCard={setActiveCard}
                  activeCard={activeCard}
                  onClick={() => onClickTask(task)} 
                />
              </motion.div>

              {/* Between-Task Drop Zone */}
              <div className="">
                <DropArea onDrop={(taskId) => handleDropInColumn(taskId, index + 1)} />
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default Column;