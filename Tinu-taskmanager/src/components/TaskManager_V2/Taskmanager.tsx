

import React, { useMemo, useState, useCallback } from "react";
import { ListTodo, Loader as LoaderIcon, CheckCircle } from "lucide-react"; // Renamed Loader
import Column from "./Column";
import { TaskAttributes } from "@/types/TaskAttributes";
import NewTaskForm from "@/components/TaskManager_V2/taskform-new";
import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast";
import LoaderUi from "./Loader";
// Axios is now used within useTaskQueries.ts
import { useAuth } from "@/Context/AuthContext";
import { useArchiveManager } from "@/hooks/useArchiveManager";
import { useTasksData } from "@/hooks/useTaskQueries"; // IMPORT YOUR NEW HOOK

// API_BASE is used in useTaskQueries.ts
// const API_BASE = import.meta.env.VITE_API_URL;

const STATUS_VALUES = {
  PLANNED: "Planned",
  IN_PROGRESS: "In-Progress",
  COMPLETED: "Completed",
} as const;

type StatusValue = "Planned" | "In-Progress" | "Completed";

const TinuMind: React.FC = () => {
  const [activeCard, setActiveCard] = useState<TaskAttributes | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskAttributes | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { user } = useAuth(); // idToken is handled within useTasksData

  const {
    tasks, // This is your task list, managed by TanStack Query
    isLoadingTasks,
    // isFetchError, // You can use these for more specific error handling
    // fetchError,
    createTask,
    isCreatingTask,
    updateTask,
    isUpdatingTask,
    deleteTask,
    // isDeletingTask, // Can be used for UI feedback
  } = useTasksData();



  // This function will be passed to useArchiveManager
  const updateTaskForArchiveManager = useCallback(
    async (taskId: string, updates: Partial<TaskAttributes>) => {
      if (!user?.sub) {
        CustomToast({
          variant: "error",
          description: "User not authenticated.",
          duration: 3000,
        });
        return;
      }
      await updateTask({ taskId, updates });
    },
    [updateTask, user?.sub]
  );

  const handleDeleteTaskCallback = useCallback(
    async (taskId: string) => {
      if (!user?.sub) {
        CustomToast({
          variant: "error",
          description: "User not authenticated",
          duration: 3000,
        });
        return;
      }
      await deleteTask(taskId);
    },
    [deleteTask, user?.sub]
  );

  const handleCreateTaskCallback = useCallback(
    // Type for data coming from the form, before server-generated fields
    (
      newTaskFormData: Omit<
        TaskAttributes,
        "id" | "userId" | "createdAt" | "updatedAt"
      >
    ) => {
      if (!user?.sub) {
        CustomToast({
          variant: "error",
          description: "User not authenticated",
          duration: 3000,
        });
        return;
      }

      const tasksInSameColumn = tasks.filter(
        (t) => t.status === newTaskFormData.status && !t.archived
      );

      const minPosition =
        tasksInSameColumn.length > 0
          ? Math.min(...tasksInSameColumn.map((t) => t.position ?? 0))
          : 2.0; // If column is empty, default to 2.0 so new position is 1.0

      const newPosition = minPosition / 2;

      // Ensure dates are handled correctly if the form provides strings
      const taskToCreate = {
        ...newTaskFormData,
        position: newPosition,
        dueDate: newTaskFormData.dueDate
          ? new Date(newTaskFormData.dueDate)
          : new Date(0),
      };
      createTask(taskToCreate);
    },
    [createTask, user?.sub, tasks] // createTask is stable
  );

  const handleTaskClick = useCallback((task: TaskAttributes) => {
    setActiveTask(task);
    setIsEditing(true);
    setIsFormOpen(true);
  }, []);

  const handleEditTaskCallback = useCallback(
    (taskWithUpdates: TaskAttributes) => {
      // Expects full task object with updates merged
      if (!user?.sub) {
        CustomToast({
          variant: "error",
          description: "User not authenticated",
          duration: 3000,
        });
        return;
      }
      const { id: taskId, ...updates } = taskWithUpdates;

      const finalUpdates: Partial<TaskAttributes> = {
        ...updates,
        completedAt:
          updates.status === STATUS_VALUES.COMPLETED
            ? updates.completedAt || new Date() // Set or keep if already completed
            : undefined, // Clear if not completed
      };
      updateTask({ taskId, updates: finalUpdates });
      // setIsEditing(false); // Usually handled by form closure
    },
    [updateTask, user?.sub] // updateTask is stable
  );

  const handleToggleChecklistItemCallback = useCallback(
    (taskId: string, itemId: string, checked: boolean) => {
      if (!user?.sub) {
        CustomToast({
          variant: "error",
          description: "User not authenticated.",
          duration: 3000,
        });
        return;
      }
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      const newChecklist = taskToUpdate.checklist?.map((item) =>
        item.id === itemId ? { ...item, completed: checked } : item
      );

      const allItemsCompleted = newChecklist?.every((item) => item.completed);

      const updates: Partial<TaskAttributes> = { checklist: newChecklist };

      if (allItemsCompleted && taskToUpdate.status !== STATUS_VALUES.COMPLETED) {
        updates.status = STATUS_VALUES.COMPLETED;
        updates.completedAt = new Date();
      }

      updateTask({ taskId, updates });
    },
    [tasks, updateTask, user?.sub] // tasks needed to find current checklist
  );

  // --- Custom hooks ---
  // useArchiveManager now receives tasks from TanStack Query and mutation functions
  useArchiveManager(
    tasks,
    updateTaskForArchiveManager,
    handleDeleteTaskCallback
  );

  // useEffect for initial fetching is now handled by useQuery within useTasksData

  const todoTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === STATUS_VALUES.PLANNED && !t.archived)
        .sort((a, b) => {
          // Primary sort: by position
          const posDiff = (a.position ?? 0) - (b.position ?? 0);
          if (posDiff !== 0) {
            return posDiff; // If positions are different, use that difference
          }
          // Secondary sort: if positions are equal, sort by task ID for stability
          return a.id.localeCompare(b.id);
        }),
    [tasks]
  );

  const doingTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === STATUS_VALUES.IN_PROGRESS && !t.archived)
        .sort((a, b) => {
          // Primary sort: by position
          const posDiff = (a.position ?? 0) - (b.position ?? 0);
          if (posDiff !== 0) {
            return posDiff;
          }
          // Secondary sort: if positions are equal, sort by task ID for stability
          return a.id.localeCompare(b.id);
        }),
    [tasks]
  );

  const doneTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === STATUS_VALUES.COMPLETED && !t.archived)
        .sort((a, b) => {
          // Primary sort: by position
          const posDiff = (a.position ?? 0) - (b.position ?? 0);
          if (posDiff !== 0) {
            return posDiff;
          }
          // Secondary sort: if positions are equal, sort by task ID for stability
          return a.id.localeCompare(b.id);
        }),
    [tasks]
  );

  if (isLoadingTasks && !tasks.length) {
    // Show loader if loading and no tasks are cached
    return <LoaderUi />;
  }
  // Add more robust error handling based on isFetchError and fetchError if needed

  const onDrop = async (
    draggedTaskId: string,
    targetStatus: StatusValue,
    targetPosition: number // Index in the *target column*
  ) => {
    console.log(
      `–– onDrop received → taskId: ${draggedTaskId}, status: ${targetStatus}, pos: ${targetPosition}`
    );

    if (!user?.sub) {
      CustomToast({
        variant: "error",
        description: "User not authenticated",
        duration: 3000,
      });
      setActiveCard(null);
      return;
    }

    const original = tasks.find((t) => t.id === draggedTaskId);
    if (!original) {
      setActiveCard(null);
      return;
    }

    // Filter tasks belonging to the target column, EXCLUDING the dragged one,
    // AND CRITICALLY, EXCLUDING archived tasks.
    // This ensures position calculation is based ONLY on visible tasks.
    const tasksInTargetColumn = tasks
      .filter(
        (t) =>
          t.status === targetStatus && t.id !== draggedTaskId && !t.archived
      ) // <--- ADDED !t.archived
      .sort((a, b) => {
        // Primary sort: by position
        const posDiff = (a.position ?? 0) - (b.position ?? 0);
        if (posDiff !== 0) {
          return posDiff;
        }
        // Secondary sort: by ID for stability
        return a.id.localeCompare(b.id); // <--- Changed to ID sort
      });

    let newPosition: number;

    if (tasksInTargetColumn.length === 0) {
      newPosition = 1.0; // If the target column is empty, set a base position
    } else if (targetPosition === 0) {
      newPosition = (tasksInTargetColumn[0].position ?? 0) / 2; // Moved to the very top
    } else if (targetPosition >= tasksInTargetColumn.length) {
      newPosition =
        (tasksInTargetColumn[tasksInTargetColumn.length - 1].position ?? 0) + 1; // Moved to the very bottom
    } else {
      // Inserted between two existing tasks
      const prevTask = tasksInTargetColumn[targetPosition - 1];
      const nextTask = tasksInTargetColumn[targetPosition];
      newPosition = ((prevTask?.position ?? 0) + (nextTask?.position ?? 0)) / 2;
    }

    // Prepare the updates to send to the backend
    const updatesForBackend: Partial<TaskAttributes> = {
      status: targetStatus,
      completedAt:
        targetStatus === STATUS_VALUES.COMPLETED ? new Date() : undefined,
      position: newPosition, // <--- Send the calculated new position
    };

    // --- Construct the NEW ORDER for optimistic update ---
    // The optimistic tasks array should ALSO only contain non-archived tasks.
    // This ensures consistency with the filtering done by useMemo for display.
    const allNonArchivedTasksExceptDragged = tasks.filter(
      (t) => t.id !== draggedTaskId && !t.archived // <--- ADDED !t.archived
    );

    const updatedTaskForOptimistic: TaskAttributes = {
      ...original,
      ...updatesForBackend,
      // Ensure Date objects for local state, as they might be strings from the backend
      dueDate:
        original.dueDate instanceof Date
          ? original.dueDate // If it's already a Date object, keep it
          : original.dueDate // If it's a string (e.g., from backend), convert it to a Date object
          ? new Date(original.dueDate)
          : "", // <--- CRUCIAL CHANGE HERE: If original.dueDate is null, undefined, or empty string, assign an empty string

      archivedAt:
        original.archivedAt instanceof Date
          ? original.archivedAt
          : original.archivedAt
          ? new Date(original.archivedAt)
          : undefined,
      completedAt:
        updatesForBackend.completedAt instanceof Date
          ? updatesForBackend.completedAt
          : updatesForBackend.completedAt
          ? new Date(updatesForBackend.completedAt)
          : undefined,
    };

    const nextTasksArrayForOptimistic = [
      ...allNonArchivedTasksExceptDragged,
      updatedTaskForOptimistic,
    ].sort((a, b) => {
      // Primary sort: by status for grouping
      if (a.status !== b.status) {
        const statusOrder = [
          STATUS_VALUES.PLANNED,
          STATUS_VALUES.IN_PROGRESS,
          STATUS_VALUES.COMPLETED,
        ];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      // Secondary sort: by position (primary) and ID (secondary for stability)
      const posDiff = (a.position ?? 0) - (b.position ?? 0);
      if (posDiff !== 0) {
        return posDiff;
      }
      return a.id.localeCompare(b.id); // <--- Changed to ID sort
    });

    // Call the updateTask mutation with the backend updates AND the filtered optimistic array
    await updateTask({
      taskId: draggedTaskId,
      updates: updatesForBackend,
      optimisticTasks: nextTasksArrayForOptimistic, // <--- Use this correctly filtered array
    });

    setActiveCard(null); // Reset active card
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 h-screen overflow-hidden">
      <div className="flex justify-end">
        <NewTaskForm
          mode={isEditing ? "edit" : "create"}
          initialTask={activeTask ?? undefined}
          opened={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setIsEditing(false);
              setActiveTask(null);
            }
          }}
          onCreate={(formData) => {
            // formData is Omit<TaskAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'> or TaskAttributes for edit
            if (isEditing && activeTask) {
              // When editing, merge activeTask's ID and other unchanged fields with formData
              const updatedTaskData = { ...activeTask, ...formData };
              handleEditTaskCallback(updatedTaskData as TaskAttributes); // Cast if necessary, ensure ID is present
            } else if (!isEditing) {
              handleCreateTaskCallback(
                formData as Omit<
                  TaskAttributes,
                  "id" | "userId" | "createdAt" | "updatedAt"
                >
              );
            }
            setIsFormOpen(false);
            setActiveTask(null);
            setIsEditing(false);
          }}
          isSubmitting={isCreatingTask || isUpdatingTask} // Disable form while mutations are pending
        />
      </div>

      <div className="overflow-x-auto md:overflow-x-hidden flex md:grid px-4 scroll-smooth snap-x snap-mandatory md:grid-cols-3 pb-4 gap-4">
        <Column
          title="Planned"
          icon={ListTodo}
          statusValue={STATUS_VALUES.PLANNED}
          tasks={todoTasks}
          bgColor="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
          shadowColor="shadow-purple-100/60 dark:shadow-purple-900/30"
          onDeleteTask={handleDeleteTaskCallback}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
          activeCard={activeCard}
          onClickTask={handleTaskClick}
          onToggleChecklistItem={handleToggleChecklistItemCallback}
        />
        <Column
          title="In-Progress"
          icon={LoaderIcon} // Renamed
          statusValue={STATUS_VALUES.IN_PROGRESS}
          tasks={doingTasks}
          bgColor="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          shadowColor="shadow-amber-100/50 dark:shadow-amber-900/30"
          onDeleteTask={handleDeleteTaskCallback}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
          activeCard={activeCard}
          onClickTask={handleTaskClick}
          onToggleChecklistItem={handleToggleChecklistItemCallback}
        />
        <Column
          title="Completed"
          icon={CheckCircle}
          statusValue={STATUS_VALUES.COMPLETED}
          tasks={doneTasks}
          bgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
          shadowColor="shadow-emerald-100/50 dark:shadow-emerald-900/30"
          onDeleteTask={handleDeleteTaskCallback}
          setActiveCard={setActiveCard}
          onDrop={onDrop}
          activeCard={activeCard}
          onClickTask={handleTaskClick}
          onToggleChecklistItem={handleToggleChecklistItemCallback}
        />
      </div>
    </div>
  );
};

export default TinuMind;
