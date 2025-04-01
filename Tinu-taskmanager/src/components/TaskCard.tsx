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

import React from "react";
import Tag from "@/components/Tag";
import DeleteIcon from "../assets/delete.png";

// Define the Task type
interface Task {
  task: string;
  status: string;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
  handleDelete: (index: number) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, handleDelete, index }) => {
  return (
    <article className="w-full min-h-[100px] border border-gray-300 rounded-lg p-4 my-4">
      {/* Task Card */}
      <p className="text-lg font-semibold mb-3">{task.task}</p>{" "}
      {/* Corrected task title */}
      <div className="flex items-center justify-between">
        {/* Task Card Bottom */}
        <div>
          {task.tags.map((tag, index) => (
            <Tag
              key={index}
              tagName={tag}
              selectTag={() => {}}
              selected={true}
            /> // ✅ Fixed Tag props
          ))}
        </div>

        <div
          className="w-[35px] h-[35px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-200"
          onClick={() => handleDelete(index)}
        >
          <img
            className="w-[20px] opacity-50 transition-all duration-300 ease-in-out hover:opacity-80"
            src={DeleteIcon}
            alt="Delete Task"
          />
        </div>
      </div>
    </article>
  );
};

export default TaskCard;
