import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskColumn from "./components/TaskColumn";
import TodoIcon from "./assets/direct-hit.png";
import DoingIcon from "./assets/glowing-star.png";
import DoneIcon from "./assets/check-mark-button.png";

interface TaskComponent {
  task: string;
  status: string;
  tags: string[];
}

const App = () => {
  const [tasks, setTasks] = useState<TaskComponent[]>(() => {
    const savedTasks = localStorage.getItem("task");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("task", JSON.stringify(tasks));
  }, [tasks]);

  const handleDelete = (taskIndex: number, status: string) => {
    const filteredTasks = tasks.filter(
      (task: TaskComponent) => task.status === status
    );
    const taskToDelete = filteredTasks[taskIndex];
    const newTasks = tasks.filter(
      (task: TaskComponent) => task !== taskToDelete
    );
    setTasks(newTasks);
  };

  return (
    <div className="grid grid-rows-[150px_auto]">
      <TaskForm setTasks={setTasks} />
      <main className="flex justify-evenly py-5 px-[8%]">
        <TaskColumn
          columnName="Todo"
          icon={TodoIcon}
          tasks={tasks.filter((task: TaskComponent) => task.status === "Todo")}
          handleDelete={(index) => handleDelete(index, "Todo")}
        />

        <TaskColumn
          columnName="Doing"
          icon={DoingIcon}
          tasks={tasks.filter((task: TaskComponent) => task.status === "Doing")}
          handleDelete={(index) => handleDelete(index, "Doing")}
        />

        <TaskColumn
          columnName="Done"
          icon={DoneIcon}
          tasks={tasks.filter((task: TaskComponent) => task.status === "Done")}
          handleDelete={(index) => handleDelete(index, "Done")}
        />
      </main>
    </div>
  );
};

export default App;
