import React, { useState } from "react";

interface DropAreaProps {
  onDrop: () => void;
}

const DropArea: React.FC<DropAreaProps> = ({ onDrop }) => {
  const [showDrop, setShowDrop] = useState(false);

  return (
    <section
      className={
        showDrop
          ? "w-full h-24 bg-gray-200 border border-dashed border-gray-200 rounded-md p-4 mb-4 opacity-100 transition-all duration-200 ease-in-out"
          : "opacity-0"
      }
      onDragEnter={() => setShowDrop(true)}
      onDragLeave={() => setShowDrop(false)}
      onDrop={(e) => {
        e.preventDefault();
        setShowDrop(false);
        onDrop(); // Ensure the function is triggered
      }}
      onDragOver={(e) => e.preventDefault()} // Allow drop
    >
      Drop Here
    </section>
  );
};

export default DropArea;
