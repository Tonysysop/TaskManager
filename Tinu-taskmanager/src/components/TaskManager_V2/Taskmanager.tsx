// ./TaskManager.tsx (TinuMind component - Updated)
//import { startTransition } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ListTodo, Loader, CheckCircle } from 'lucide-react';
import Column from './Column'; // Adjust path if needed
import { TaskAttributes } from '@/types/TaskAttributes';
import NewTaskForm from "@/components/TaskManager_V2/taskform-new"; // Adjust path
import { fetchAuthSession } from "aws-amplify/auth";
import { toast } from "sonner";

// Define status values using 'as const' for stricter type checking
const STATUS_VALUES = {
    PLANNED: 'planned',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
} as const;

type StatusValue = 'planned' | 'in-progress' | 'completed';



// --- Helper Functions ---
const getCurrentUserEmail = async (): Promise<string | null> => {
    try {
        const session = await fetchAuthSession();
        return (session.tokens?.idToken?.payload?.email as string | null) ?? null;
    } catch (error) {
        console.error("Failed to get user email:", error);
        toast.error("Failed to load user email", { description: "Please try again later." });
        return null;
    }
};
// Safely parse tasks from JSON, ensuring dates are handled
const parseTasks = (jsonString: string | null): TaskAttributes[] => {
    if (!jsonString) return [];
    try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
            console.warn("Stored tasks data is not an array, resetting.");
            return [];
        }
        // Ensure each task has an id and map dates correctly
        return parsed.map((task: any) => ({
            ...task,
            id: task.id ?? crypto.randomUUID(), // Assign ID if missing (consider better ID generation)
            dueDate: task.dueDate ? new Date(task.dueDate) : null, // Convert string back to Date object
            // Ensure other required fields exist or have defaults
            task: task.task ?? 'Untitled Task',
            status: task.status ?? STATUS_VALUES.PLANNED,
            priority: task.priority ?? 'Normal',
            description: task.description ?? '',
            tags: task.tags ?? [],
        })).filter(task => Object.values(STATUS_VALUES).includes(task.status)); // Filter out tasks with invalid status
    } catch (error) {
        console.error("Failed to parse tasks from localStorage:", error);
        return [];
    }
};
// --- Component ---
const TinuMind = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskAttributes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

  // State for visual feedback during drag (task object)
  const [activeCard, setActiveCard] = useState<TaskAttributes | null>(null);

  // Effect for loading tasks on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialTasks = async () => {
      setIsLoading(true);
      const email = await getCurrentUserEmail();
      if (!isMounted) return;

      setUserEmail(email);
      const storageKey = email ? `tasks-${email}` : "tasks"; // Fallback to generic key
      const savedTasksString = localStorage.getItem(storageKey);
      const loadedTasks = parseTasks(savedTasksString);

      if (isMounted) {
        setTasks(loadedTasks);
        setIsLoading(false);
        if (email) {
             localStorage.setItem('lastUserEmail', email); // Remember for potential faster load next time
          }
        }
    };
    loadInitialTasks();
    return () => { isMounted = false; }; // Cleanup on unmount
  }, []);

  // Effect for saving tasks when they change
  useEffect(() => {
    // Avoid saving during initial load or if tasks haven't changed meaningfully
    if (isLoading) return;
    const storageKey = userEmail ? `tasks-${userEmail}` : "tasks";
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, userEmail, isLoading]); // Depend on isLoading to prevent premature saves

  // Filter tasks for each column (memoize if performance becomes an issue)
  const todoTasks = useMemo(() => tasks.filter(task => task.status === STATUS_VALUES.PLANNED), [tasks]);
  const doingTasks = useMemo(() => tasks.filter(task => task.status === STATUS_VALUES.IN_PROGRESS), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(task => task.status === STATUS_VALUES.COMPLETED), [tasks]);


  // Handler for deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    toast.success("Task deleted", {
      description: "The task has been removed from your list",
    });
  };

  const onDrop = (
  draggedTaskId: string,
  targetStatus: StatusValue,
  targetPosition: number
) => {
  console.log(
    `–– onDrop received → taskId: ${draggedTaskId}, status: ${targetStatus}, pos: ${targetPosition}`
  );

  // 1) Find the original task
  const original = tasks.find((t) => t.id === draggedTaskId);
  if (!original) {
    console.error("❌ onDrop: dragged task not found", draggedTaskId);
    setActiveCard(null);
    return;
  }

  // 2) Early exit if status & effective position didn’t change
  if (
    original.status === targetStatus &&
    (() => {
      const sameCol = tasks.filter((t) => t.status === targetStatus);
      const idx = sameCol.findIndex((t) => t.id === draggedTaskId);
      return idx === targetPosition || idx + 1 === targetPosition;
    })()
  ) {
    console.log("↩️ onDrop: no change in status/position");
    setActiveCard(null);
    return;
  }

  // 3) Build new array without the dragged task
  const withoutOriginal = tasks.filter((t) => t.id !== draggedTaskId);
  const updatedTask: TaskAttributes = { ...original, status: targetStatus };

  // 4) Compute insertion index in the full array
  const peers = withoutOriginal.filter((t) => t.status === targetStatus);
  let insertAt: number;

  if (peers.length === 0) {
    // If column is empty, drop at top
    const firstIndex = withoutOriginal.findIndex((t) => t.status === targetStatus);
    insertAt = Math.max(0, firstIndex);
  } else {
    if (targetPosition === 0) {
      // Before the first peer
      insertAt = withoutOriginal.findIndex((t) => t.id === peers[0].id);
    } else {
      // After the (position-1)th peer
      const beforePeer = peers[targetPosition - 1];
      const idx = withoutOriginal.findIndex((t) => t.id === beforePeer.id);
      insertAt = idx + 1;
    }
  }

  // 5) Clamp into [0, withoutOriginal.length]
  insertAt = Math.min(Math.max(0, insertAt), withoutOriginal.length);
  console.log(`→ Inserting at absolute index: ${insertAt}`);

  // 6) Construct and set new state
  const next = [
    ...withoutOriginal.slice(0, insertAt),
    updatedTask,
    ...withoutOriginal.slice(insertAt),
  ];
  console.log("→ New task order:", next.map((t) => t.id).join(", "));

  setTasks(next);
  setActiveCard(null);
};



  // Render Loading or Task Board
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading tasks...</div>; // Or a spinner component
  }

  return (
    // Main container - control height and prevent body scroll
    <div className="flex flex-col gap-6 p-4 md:p-6 h-screen overflow-hidden">
      <div className="flex justify-end">
    <NewTaskForm setTasks={setTasks} />
  </div>
      {/* Grid container for columns - takes remaining space */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
        {/* Pass props to each Column */}
        <Column
          title="Todo"
          icon={ListTodo}
          statusValue={STATUS_VALUES.PLANNED} // Pass internal status value
          tasks={todoTasks}
          bgColor="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
          shadowColor="shadow-purple-100/50 dark:shadow-purple-900/30"
          onDeleteTask={handleDeleteTask}
          setActiveCard={setActiveCard}
          onDrop={onDrop} // Pass the main handler
          activeCard={activeCard}
        />
        <Column
          title="In Progress"
          icon={Loader}
          statusValue={STATUS_VALUES.IN_PROGRESS}
          tasks={doingTasks}
          bgColor="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          shadowColor="shadow-amber-100/50 dark:shadow-amber-900/30"
          onDeleteTask={handleDeleteTask}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
          activeCard={activeCard}
        />
        <Column
          title="Done"
          icon={CheckCircle}
          statusValue={STATUS_VALUES.COMPLETED}
          tasks={doneTasks}
          bgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
          shadowColor="shadow-emerald-100/50 dark:shadow-emerald-900/30"
          onDeleteTask={handleDeleteTask}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
          activeCard={activeCard}
        />
      </div>
    </div>
  );
};

export default TinuMind;