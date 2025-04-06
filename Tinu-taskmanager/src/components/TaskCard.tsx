// import React from 'react'
// import Tag from '@/components/Tag'
// import DeleteIcon from '../assets/delete.png'

// // Define the Task type
// interface Task {
//   task: string;
//   status: string;
//   tags: string[];
// }

// interface TaskCardProps {
//   task: Task; // Expect a 'task' prop
// }

// const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
//   return (
//     <article className='w-full min-h-[100px] border border-gray-300 rounded-lg p-4 my-4'> {/*Task_card*/}
//         <p className='text-lg font-semibold mb-3'>{task.task}</p>{/*taskTest*/}

//         <div className='flex items-center justify-between'>{/*task_card_bottom_line*/}
//            <div>
//                {task.tags.map((tag, index) => (
//                   <Tag key={index} tagName={tag} />
//                 ))}
//            </div>{/*task_card_tag*/}

//            <div className='w-[35px] h-[35px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-200'>
//                 <img className='w-[20px] opacity-50 transition-all duration-300 ease-in-out hover:opacity-80' src={DeleteIcon} alt="" /> {/*Delete icon*/}
//            </div> {/*task_delete*/}
//         </div>
//     </article>
//   )
// }

// export default TaskCard

//

// src/components/TaskCard.tsx
import React from "react";
import Tag from "@/components/Tag"; // Assuming Tag component path is correct
import DeleteIcon from "../assets/delete.png";

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

  return (
    <article
      className="w-full min-h-[100px] border border-gray-300 rounded-lg p-2 bg-white shadow active:opacity-40 active:border active:border-gray-900 cursor-grab active:cursor-grabbing" // Added bg-white, shadow, active:cursor-grabbing
      draggable
      onDragStart={handleDragStart} // Use updated handler
      onDragEnd={handleDragEnd} // Use updated handler
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
                key={tagIndex} // Use tagIndex for key here
                tagName={tag}
                // Assuming selectTag and selected are handled correctly by Tag component
                selectTag={() => {}}
                selected={true}
              />
            )
          )}
          {/* Date Section */}
          <p className="text-left text-xs font-medium bg-gray-100 border border-gray-300 rounded-md px-2 w-fit">
            Created : {new Date(task.date).toLocaleDateString()}
          </p>
        </div>

        <div
          className="w-[35px] h-[35px] rounded-full flex items-center justify-center cursor-pointer mb-2.5 transition-all duration-300 ease-in-out hover:bg-gray-200"
          // --- Call handleDelete with the task object ---
          onClick={() => handleDelete(task)}
        >
          <img
            className="w-[20px] opacity-50 transition-all duration-300 ease-in-out hover:opacity-80 "
            src={DeleteIcon}
            alt="Delete Task"
          />
        </div>
      </div>
    </article>
  );
};

export default TaskCard;
