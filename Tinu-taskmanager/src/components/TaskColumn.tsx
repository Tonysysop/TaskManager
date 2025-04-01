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




import React from 'react'
import TaskCard from '@/components/TaskCard';

// Define the Task type
interface TaskComponent {
  task: string;
  status: string;
  tags: string[];
}

interface TaskColumnProps {
  icon: string;
  columnName: string;
  tasks: TaskComponent[]; // Ensure tasks is an array
}

const TaskColumn: React.FC<TaskColumnProps> = ({ icon, columnName, tasks }) => {
  return (
    <section className='w-1/3 m-5'>
        <h2 className='flex items-center font-bold'>
            <img className='w-[30px] mr-[5px]' src={icon} alt="" /> {columnName}
        </h2> 

        {tasks.map((task, index) => (
          <TaskCard 
            key={index} 
            task={task} // ✅ Pass the entire task object
          />
        ))}
    </section>
  )
}

export default TaskColumn
