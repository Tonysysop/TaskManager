// import React from 'react'
// import TaskCard from '@/components/TaskCard';

// // Define the Task type
// interface TaskComponent {
//   task: string;
//   status: string;
//   tags: string[];
// }

// interface TaskColumnProps {
//   icon: string;
//   columnName: string;
//   tasks: TaskComponent[]; // Ensure tasks is an array
// }

// const TaskColumn: React.FC<TaskColumnProps> = ({ icon, columnName, tasks }) => {
//   return (
//     <section className='w-1/3  m-5'>
//         <h2 className='flex items-center font-bold'>
//             <img className='w-[30px] mr-[5px]' src={icon} alt="" /> {columnName}
//         </h2> {/*Task_column_heading and task_column icon*/}

//         {tasks.map(
//           (task, index) =>
//             <TaskCard
//               key={index}
//               columnName = {task.task}
//               tags={task.tags}
//              />
//         )}
//     </section>
//   )
// }

// export default TaskColumn

// import React from "react";
// import TaskCard from "@/components/TaskCard";
// import DropArea from "./DropArea";

// // Define the Task type
// interface TaskComponent {
//   index: string;
//   task: string;
//   status: string;
//   tags: string[];
// }

// interface TaskColumnProps {
//   icon: string;
//   columnName: string;
//   tasks: TaskComponent[]; // Ensure tasks is an array
//   handleDelete: (id: string) => void;
//   setActiveCard: (id: string | null) => void;
//   onDrop: (status: string, position: number) => void;
// }

// const TaskColumn: React.FC<TaskColumnProps> = ({
//   icon,
//   columnName,
//   tasks,
//   handleDelete,
//   setActiveCard,
//   onDrop,
// }) => {
//   return (
//     <section className="w-1/3 m-5">
//       <h2 className="flex items-center font-bold mb-4">
//         <img className="w-[30px] mr-[5px]" src={icon} alt="" /> {columnName}
//       </h2>

//       <DropArea onDrop={() => onDrop(columnName, 0)} />

//       {tasks.map((task, index) => (
//         <React.Fragment key={task.index}>
//           <TaskCard
//             task={task}
//             handleDelete={handleDelete}
//             index={index}
//             setActiveCard={setActiveCard}
//           />
//           <DropArea onDrop={() => onDrop(columnName, index + 1)} />
//         </React.Fragment>
//       ))}
//     </section>
//   );
// };

// export default TaskColumn;

// src/components/TaskColumn.tsx
import React from "react";
import TaskCard from "@/components/TaskCard"; // Make sure path is correct
import DropArea from "./DropArea";

// Define or import the Task type
interface TaskComponent {
  task: string;
  status: string;
  tags: string[];
  date:string
  // id?: string | number;
}

interface TaskColumnProps {
  icon: string;
  columnName: string;
  tasks: TaskComponent[];
  // --- Updated prop types ---
  handleDelete: (taskToDelete: TaskComponent) => void;
  setActiveCard: (task: TaskComponent | null) => void;
  onDrop: (status: string, position: number) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  icon,
  columnName,
  tasks = [], // Default to empty array
  handleDelete,
  setActiveCard,
  onDrop,
}) => {
  return (
    <section className="w-full md:w-1/3 m-2 p-4 bg-gray-50 rounded-lg shadow">
      {" "}
      {/* Added styling */}
      <h2 className="flex items-center font-bold mb-4 text-xl">
        {" "}
        {/* Larger heading */}
        <img
          className="w-[30px] mr-[10px]"
          src={icon}
          alt={`${columnName} icon`}
        />{" "}
        {columnName}
      </h2>
      {/* Drop area at the top of the column (position 0) */}
      <DropArea onDrop={() => onDrop(columnName, 0)} />
      {/* Render tasks and drop areas between them */}
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <React.Fragment key={index}>
            <TaskCard
              task={task}
              handleDelete={handleDelete}
              setActiveCard={setActiveCard}
              index={index}
            />
            <DropArea onDrop={() => onDrop(columnName, index + 1)} />
          </React.Fragment>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No tasks yet</p> // Placeholder for empty columns
      )}
    </section>
  );
};

export default TaskColumn;
