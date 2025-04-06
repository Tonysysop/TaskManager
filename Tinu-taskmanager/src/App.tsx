// import { useState, useEffect } from "react";
// import TaskForm from "./components/TaskForm";
// import TaskColumn from "./components/TaskColumn";
// import TodoIcon from "./assets/direct-hit.png";
// import DoingIcon from "./assets/glowing-star.png";
// import DoneIcon from "./assets/check-mark-button.png";

// interface TaskComponent {
//   index: string;
//   task: string;
//   status: string;
//   tags: string[];
// }

// const App = () => {
//   const [tasks, setTasks] = useState<TaskComponent[]>(() => {
//     const savedTasks = localStorage.getItem("task");
//     return savedTasks ? JSON.parse(savedTasks) : [];
//   });

//   // use state for card movement
//   const [activeCard, setActiveCard] = useState<string | null>(null);

//   useEffect(() => {
//     localStorage.setItem("task", JSON.stringify(tasks));
//   }, [tasks]);

//   const handleDelete = (id: string) => {
//     const newTasks = tasks.filter((task: TaskComponent) => task.index !== id);
//     setTasks(newTasks);
//   };

//   const onDrop = (status: string, position: number) => {
//     if (!activeCard) return;

//     setTasks((prevTasks) => {
//       // Find the task being dragged
//       const draggedTask = prevTasks.find((task) => task.index === activeCard);
//       if (!draggedTask) return prevTasks;

//       // Remove the task from the old position
//       const updatedTasks = prevTasks.filter(
//         (task) => task.index !== activeCard
//       );

//       // Update the status and insert the task at the correct position
//       updatedTasks.splice(position, 0, { ...draggedTask, status });

//       return updatedTasks;
//     });
//   };

//   return (
//     <div className="grid grid-rows-[150px_auto]">
//       <TaskForm setTasks={setTasks} />
//       <main className="flex justify-evenly py-5 px-[8%]">
//         <TaskColumn
//           columnName="Todo"
//           icon={TodoIcon}
//           tasks={tasks.filter((task: TaskComponent) => task.status === "Todo")}
//           handleDelete={(id) => handleDelete(id)}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//         />

//         <TaskColumn
//           columnName="Doing"
//           icon={DoingIcon}
//           tasks={tasks.filter((task: TaskComponent) => task.status === "Doing")}
//           handleDelete={(id) => handleDelete(id)}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//         />

//         <TaskColumn
//           columnName="Done"
//           icon={DoneIcon}
//           tasks={tasks.filter((task: TaskComponent) => task.status === "Done")}
//           handleDelete={(id) => handleDelete(id)}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//         />
//       </main>
//     </div>
//   );
// };

// export default App;

// src/App.tsx
import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskColumn from "./components/TaskColumn";
import TodoIcon from "./assets/direct-hit.png";
import DoingIcon from "./assets/glowing-star.png";
import DoneIcon from "./assets/check-mark-button.png";

// Define or import the Task type
interface TaskComponent {
  task: string;
  status: string;
  tags: string[];
  date: string;
  // Add a unique ID if possible for more reliable identification
  // id?: string | number;
}

const App = () => {
  const [tasks, setTasks] = useState<TaskComponent[]>(() => {
    const savedTasks = localStorage.getItem("tasks"); // Consistent key 'tasks'
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // --- State stores the actual task object being dragged ---
  const [activeCard, setActiveCard] = useState<TaskComponent | null>(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks)); // Consistent key 'tasks'
  }, [tasks]);

  // --- Simplified handleDelete ---
  // It now receives the task object to delete
  const handleDelete = (taskToDelete: TaskComponent) => {
    // If tasks have unique IDs, filtering by ID is more robust:
    // setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));

    // If relying on object reference (ensure objects are treated immutably):
    setTasks((prevTasks) => prevTasks.filter((task) => task !== taskToDelete));
  };

  // --- Updated onDrop logic ---
  const onDrop = (status: string, position: number) => {
    console.log(
      `Attempting to drop task into ${status} at position ${position}`
    );

    if (!activeCard) {
      console.log("Drop cancelled: No active card.");
      return; // No task was being dragged
    }

    console.log(`Task to move: ${activeCard.task}`);

    // 1. Create the updated task object with the new status
    const taskToMove = { ...activeCard, status: status };

    // 2. Remove the original task from the list
    //    Filter based on the object reference or a unique ID
    const tasksWithoutOriginal = tasks.filter((task) => task !== activeCard);
    // Or if using IDs: const tasksWithoutOriginal = tasks.filter(task => task.id !== activeCard.id);

    // 3. Insert the updated task at the specified position
    //    Create a new array to maintain immutability
    const updatedTasks = [
      ...tasksWithoutOriginal.slice(0, position), // Elements before insertion point
      taskToMove, // The moved task
      ...tasksWithoutOriginal.slice(position), // Elements after insertion point
    ];

    console.log("Updating tasks state:", updatedTasks);

    // 4. Update state
    setTasks(updatedTasks);

    // 5. Reset activeCard (already handled in TaskCard's onDragEnd, but good for clarity)
    setActiveCard(null);
  };

  return (
    <div className="grid grid-rows-[auto_1fr] min-h-screen gap-4">
      {" "}
      {/* Adjusted grid layout */}
      <TaskForm setTasks={setTasks} />
      <main className="flex justify-evenly py-2 px-[8%]">
        {" "}
        {/* Added gap */}
        <TaskColumn
          columnName="Todo"
          icon={TodoIcon}
          // Filter tasks for this column
          tasks={tasks.filter((task) => task.status === "Todo")}
          handleDelete={handleDelete} // Pass the updated handler
          setActiveCard={setActiveCard} // Pass the state setter
          onDrop={onDrop} // Pass the updated drop handler
        />
        <TaskColumn
          columnName="Doing"
          icon={DoingIcon}
          tasks={tasks.filter((task) => task.status === "Doing")}
          handleDelete={handleDelete}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
        />
        <TaskColumn
          columnName="Done"
          icon={DoneIcon}
          tasks={tasks.filter((task) => task.status === "Done")}
          handleDelete={handleDelete}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
        />
      </main>
    </div>
  );
};

export default App;
