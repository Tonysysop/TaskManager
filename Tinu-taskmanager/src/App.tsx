
import  { useState } from 'react'
import TaskForm from './components/TaskForm'
import TaskColumn from './components/TaskColumn'
import TodoIcon from "./assets/direct-hit.png"
import DoingIcon from "./assets/glowing-star.png"
import DoneIcon from "./assets/check-mark-button.png"


interface TaskComponent { 
  task: string;
  status: string;
  tags: string[];
}

const App = () => {
  const [tasks, setTasks] = useState<TaskComponent[]>([])
  console.log("tasks", tasks)
  return (
    <div className='grid grid-rows-[150px_auto]'>
      <TaskForm setTasks = {setTasks} />
      <main className='flex justify-evenly py-5 px-[8%]'>
        <TaskColumn 
          columnName="Todo" 
          icon={TodoIcon} 
          tasks={tasks.filter(task => task.status === "Todo")}
        />
         
        <TaskColumn 
          columnName="Doing" icon={DoingIcon}
          tasks={tasks.filter(task => task.status === "Doing")}
        />
          
        <TaskColumn 
          columnName="Done" 
          icon={DoneIcon} 
          tasks={tasks.filter(task => task.status === "Done")} />
      </main>
    </div>
  )
}

export default App




