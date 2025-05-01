// DropArea2.tsx
import React, { useState } from "react";

interface DropAreaProps {
  onDrop: (taskId: string) => void;
}

const DropArea = ({ onDrop }: DropAreaProps) => {
  const [isOver, setIsOver] = useState(false);
  

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isOver) setIsOver(true);
  };
  const handleDragLeave = () => {
    setIsOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    setIsOver(false);
    if (taskId) onDrop(taskId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full 
        transition-all duration-150 ease-out
        ${isOver ? "w-full bg-violet-400/80 min-h-[100px] border border-border rounded-lg" : "h-3 bg-violet-400/20 opacity-0"}
        rounded
        my-1
      `}
    />
  );
};

export default DropArea;
