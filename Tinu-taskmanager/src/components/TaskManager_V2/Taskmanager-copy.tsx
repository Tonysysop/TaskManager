// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import { ListTodo, Loader, CheckCircle } from "lucide-react";
// import Column from "./Column";
// import { TaskAttributes } from "@/types/TaskAttributes";
// import NewTaskForm from "@/components/TaskManager_V2/taskform-new";
// import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast";
// import LoaderUi from "./Loader";
// import axios from "axios";
// import { useAuth } from "@/Context/AuthContext";
// import { useArchiveManager } from "@/hooks/useArchiveManager";

// const API_BASE = import.meta.env.VITE_API_URL;

// const STATUS_VALUES = {
//   PLANNED: "Planned",
//   IN_PROGRESS: "In-Progress",
//   COMPLETED: "Completed",
// } as const;

// type StatusValue = "Planned" | "In-Progress" | "Completed";

// const TinuMind: React.FC = () => {
//   // --- All useState hooks MUST be declared first and unconditionally ---
//   const [tasks, setTasks] = useState<TaskAttributes[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeCard, setActiveCard] = useState<TaskAttributes | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTask, setActiveTask] = useState<TaskAttributes | null>(null);
//   const [isFormOpen, setIsFormOpen] = useState(false);

//   // --- useContext hooks must also be declared unconditionally ---
//   const { idToken, user } = useAuth();

//   // --- All useCallback definitions MUST come next and unconditionally ---
//   const updateTaskInMainList = useCallback(
//     async (taskId: string, updates: Partial<TaskAttributes>) => {
//       setTasks((prev) =>
//         prev.map((t) =>
//           t.id === taskId
//             ? {
//                 ...t,
//                 ...updates,
//                 dueDate:
//                   updates.dueDate !== undefined
//                     ? updates.dueDate instanceof Date
//                       ? updates.dueDate
//                       : new Date(updates.dueDate)
//                     : t.dueDate,
//                 completedAt:
//                   updates.completedAt !== undefined
//                     ? updates.completedAt instanceof Date
//                       ? updates.completedAt
//                       : new Date(updates.completedAt)
//                     : t.completedAt,
//                 archivedAt:
//                   updates.archivedAt !== undefined
//                     ? updates.archivedAt instanceof Date
//                       ? updates.archivedAt
//                       : new Date(updates.archivedAt)
//                     : t.archivedAt,
//               }
//             : t
//         )
//       );

//       if (!user?.sub || !idToken) {
//         CustomToast({
//           variant: "error",
//           description:
//             "User not authenticated. Cannot update task from archive manager.",
//           duration: 3000,
//         });
//         return;
//       }

//       const payload: Partial<TaskAttributes> & { id: string; userId: string } =
//         {
//           id: taskId,
//           userId: user.sub,
//           ...updates,
//         };
//       if (payload.dueDate instanceof Date)
//         payload.dueDate = payload.dueDate.toISOString();
//       if (payload.completedAt instanceof Date)
//         payload.completedAt = payload.completedAt.toISOString();
//       if (payload.archivedAt instanceof Date)
//         payload.archivedAt = payload.archivedAt.toISOString();

//       try {
//         await axios.patch(`${API_BASE}/tasks`, payload, {
//           headers: { Authorization: `Bearer ${idToken}` },
//         });
//         CustomToast({
//           variant: "success",
//           description: "Task updated (by archive manager).",
//           duration: 2000,
//         });
//       } catch (error: any) {
//         console.error("Backend update failed from useArchiveManager:", error);
//         CustomToast({
//           variant: "error",
//           description:
//             error.response?.data?.error ||
//             "Failed to update task from archive manager.",
//           duration: 3000,
//         });
//       }
//     },
//     [setTasks, user?.sub, idToken]
//   );

//   const handleDeleteTask = useCallback(
//     async (taskId: string) => {
//       if (!user?.sub) {
//         CustomToast({
//           variant: "error",
//           description: "User not authenticated",
//           duration: 3000,
//         });
//         return;
//       }

//       try {
//         const res = await axios.delete(`${API_BASE}/tasks`, {
//           headers: { Authorization: `Bearer ${idToken} ` },
//           data: {
//             taskId,
//             userId: user.sub,
//           },
//         });

//         if (res.status >= 200 && res.status < 300) {
//           setTasks((prev) => prev.filter((t) => t.id !== taskId));
//           CustomToast({
//             variant: "success",
//             description: "Task Deleted Successfully",
//             duration: 3000,
//           });
//         } else {
//           CustomToast({
//             variant: "error",
//             description: (res.data as any).error || "Failed to delete task",
//             duration: 3000,
//           });
//         }
//       } catch (err: any) {
//         const message =
//           err.response?.data?.error || err.message || "Something went wrong";
//         CustomToast({ variant: "error", description: message, duration: 3000 });
//         console.error(err);
//       }
//     },
//     [user?.sub, idToken]
//   );

//   const handleCreateTask = useCallback(
//     (newTask: TaskAttributes) => {
//       if (!user?.sub) {
//         CustomToast({
//           variant: "error",
//           description: "User not authenticated",
//           duration: 3000,
//         });
//         return;
//       }

//       const payload = {
//         ...newTask,
//         userId: user?.sub,
//         dueDate: newTask.dueDate
//           ? new Date(newTask.dueDate).toISOString()
//           : undefined,
//       };

//       const normalizedTask: TaskAttributes = {
//         ...newTask,
//         id: newTask.id || `temp-${Date.now()}`,
//         dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(0),
//       };

//       setTasks((prev) => [...prev, normalizedTask]);

//       axios
//         .post(`${API_BASE}/tasks`, payload, {
//           headers: { Authorization: `Bearer ${idToken} ` },
//         })
//         .then(() => {
//           CustomToast({
//             variant: "success",
//             description: "Task created",
//             duration: 3000,
//           });
//         })
//         .catch((error) => {
//           console.error("Error creating task:", error);
//           setTasks((prev) =>
//             prev.filter((task) => task.id !== normalizedTask.id)
//           );
//           CustomToast({
//             variant: "error",
//             description: "Failed to create task",
//             duration: 3000,
//           });
//         });
//     },
//     [user?.sub, idToken]
//   );

//   const handleTaskClick = useCallback((task: TaskAttributes) => {
//     console.log("Task clicked:", task);
//     setActiveTask(task);
//     setIsEditing(true);
//     setIsFormOpen(true);
//   }, []);

//   const handleEditTask = useCallback(
//     async (updatedTask: TaskAttributes) => {
//       if (!user?.sub) {
//         CustomToast({
//           variant: "error",
//           description: "User not authenticated",
//           duration: 3000,
//         });
//         return;
//       }

//       const originalTask = tasks.find((t) => t.id === updatedTask.id);

//       setTasks((prev) =>
//         prev.map((t) =>
//           t.id === updatedTask.id
//             ? {
//                 ...updatedTask,
//                 dueDate: updatedTask.dueDate
//                   ? new Date(updatedTask.dueDate)
//                   : new Date(0),
//               }
//             : t
//         )
//       );
//       setIsEditing(false);

//       try {
//         const isoDueDate = updatedTask.dueDate
//           ? new Date(updatedTask.dueDate).toISOString()
//           : undefined;

//         const patchPayload = {
//           id: updatedTask.id,
//           userId: user.sub,
//           task: updatedTask.task,
//           status: updatedTask.status,
//           priority: updatedTask.priority,
//           dueDate: isoDueDate,
//           description: updatedTask.description,
//           checklist: updatedTask.checklist,
//           showDescriptionOnCard: updatedTask.showDescriptionOnCard,
//           showChecklistOnCard: updatedTask.showChecklistOnCard,
//           tags: updatedTask.tags,
//           archived: updatedTask.archived,
//           archivedAt: updatedTask.archivedAt
//             ? new Date(updatedTask.archivedAt).toISOString()
//             : undefined,
//           completedAt:
//             updatedTask.status === STATUS_VALUES.COMPLETED
//               ? new Date().toISOString()
//               : undefined,
//         };

//         await axios.patch(`${API_BASE}/tasks`, patchPayload, {
//           headers: { Authorization: `Bearer ${idToken}` },
//         });

//         CustomToast({
//           variant: "success",
//           description: "Task updated",
//           duration: 3000,
//         });
//       } catch (err: any) {
//         console.error("Update failed", err);
//         CustomToast({
//           variant: "error",
//           description: err.response?.data?.error || "Failed to update task",
//           duration: 3000,
//         });
//         if (originalTask) {
//           setTasks((prev) =>
//             prev.map((t) => (t.id === originalTask.id ? originalTask : t))
//           );
//         }
//       }
//     },
//     [user?.sub, idToken, tasks]
//   );

//   const handleToggleChecklistItem = useCallback(
//     async (taskId: string, itemId: string, checked: boolean) => {
//       if (!user?.sub || !idToken) {
//         CustomToast({
//           variant: "error",
//           description: "User not authenticated. Cannot update checklist.",
//           duration: 3000,
//         });
//         return;
//       }

//       let originalTask: TaskAttributes | undefined;
//       let updatedTaskForBackend: TaskAttributes | undefined;

//       setTasks((prevTasks) =>
//         prevTasks.map((task) => {
//           if (task.id === taskId) {
//             originalTask = { ...task };
//             const newChecklist = task.checklist?.map((item) =>
//               item.id === itemId ? { ...item, completed: checked } : item
//             );
//             updatedTaskForBackend = {
//               ...task,
//               checklist: newChecklist,
//             };
//             return updatedTaskForBackend;
//           }
//           return task;
//         })
//       );

//       if (updatedTaskForBackend) {
//         try {
//           const patchPayload = {
//             id: updatedTaskForBackend.id,
//             userId: user.sub,
//             task: updatedTaskForBackend.task,
//             status: updatedTaskForBackend.status,
//             priority: updatedTaskForBackend.priority,
//             dueDate: updatedTaskForBackend.dueDate
//               ? new Date(updatedTaskForBackend.dueDate).toISOString()
//               : undefined,
//             description: updatedTaskForBackend.description,
//             checklist: updatedTaskForBackend.checklist,
//             showDescriptionOnCard: updatedTaskForBackend.showDescriptionOnCard,
//             showChecklistOnCard: updatedTaskForBackend.showChecklistOnCard,
//             tags: updatedTaskForBackend.tags,
//             archived: updatedTaskForBackend.archived,
//             archivedAt: updatedTaskForBackend.archivedAt
//               ? new Date(updatedTaskForBackend.archivedAt).toISOString()
//               : undefined,
//             completedAt: updatedTaskForBackend.completedAt
//               ? new Date(updatedTaskForBackend.completedAt).toISOString()
//               : undefined,
//           };

//           await axios.patch(`${API_BASE}/tasks`, patchPayload, {
//             headers: { Authorization: `Bearer ${idToken}` },
//           });

//           CustomToast({
//             variant: "success",
//             description: "Checklist item updated.",
//             duration: 2000,
//           });
//         } catch (err: any) {
//           console.error("Checklist update failed", err);
//           CustomToast({
//             variant: "error",
//             description:
//               err.response?.data?.error || "Failed to update checklist item.",
//             duration: 3000,
//           });
//           if (originalTask) {
//             setTasks((prevTasks) =>
//               prevTasks.map((task) =>
//                 task.id === taskId ? originalTask! : task
//               )
//             );
//           }
//         }
//       }
//     },
//     [user?.sub, idToken]
//   );

//   // --- Custom hooks must also be called unconditionally ---
//   // The useArchiveManager hook no longer returns `archivedTasks` or `getTasksEligibleForArchival`.
//   // It primarily manages the auto-archival logic based on the `tasks` and `updateTask` you pass it.
//   useArchiveManager(
//     tasks,
//     updateTaskInMainList,
//     handleDeleteTask // Assuming deleteTaskFromMainList in useArchiveManager maps to handleDeleteTask here
//   );

//   useEffect(() => {
//     if (!user?.sub || !idToken) {
//       setIsLoading(false);
//       return;
//     }

//     const fetchTasks = async () => {
//       setIsLoading(true);
//       try {
//         const res = await axios.get<TaskAttributes[]>(`${API_BASE}/tasks`, {
//           params: { userId: user?.sub },
//           headers: { Authorization: `Bearer ${idToken} ` },
//         });
//         const data = res.data;

//         setTasks(
//           data.map((t) => ({
//             ...t,
//             dueDate: t.dueDate ? new Date(t.dueDate) : new Date(0),
//             completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
//             archivedAt: t.archivedAt ? new Date(t.archivedAt) : undefined,
//           }))
//         );
//       } catch (err: any) {
//         console.error("Could not load tasks:", err);
//         CustomToast({
//           variant: "error",
//           description: "Could not load tasks",
//           duration: 3000,
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTasks();
//   }, [user?.sub, idToken]);

//   // Removed the useEffect hook that logged archivedTasks and getTasksEligibleForArchival
//   // as getTasksEligibleForArchival no longer exists.

//   // --- All useMemo hooks should also be declared unconditionally ---
//   const todoTasks = useMemo(
//     () =>
//       tasks.filter((t) => t.status === STATUS_VALUES.PLANNED && !t.archived),
//     [tasks]
//   );
//   const doingTasks = useMemo(
//     () =>
//       tasks.filter(
//         (t) => t.status === STATUS_VALUES.IN_PROGRESS && !t.archived
//       ),
//     [tasks]
//   );
//   const doneTasks = useMemo(
//     () =>
//       tasks.filter((t) => t.status === STATUS_VALUES.COMPLETED && !t.archived),
//     [tasks]
//   );

//   // --- Now, any conditional return (like for loading) is safe ---
//   if (isLoading) {
//     return <LoaderUi />;
//   }

// const onDrop = async (
//   draggedTaskId: string,
//   targetStatus: StatusValue,
//   targetPosition: number
// ) => {
//   console.log(
//     `–– onDrop received → taskId: ${draggedTaskId}, status: ${targetStatus}, pos: ${targetPosition}`
//   );

//   const original = tasks.find((t) => t.id === draggedTaskId);
//   if (!original) {
//     setActiveCard(null);
//     return;
//   }

//   const withoutOriginal = tasks.filter((t) => t.id !== draggedTaskId);
//   const updatedTask: TaskAttributes = {
//     ...original,
//     status: targetStatus,
//     completedAt:
//       targetStatus === STATUS_VALUES.COMPLETED ? new Date() : undefined,
//   };
//   const peers = withoutOriginal.filter((t) => t.status === targetStatus);

//   let insertAt: number;
//   if (peers.length === 0) {
//     insertAt =
//       withoutOriginal.findIndex((t) => t.status === targetStatus) || 0;
//   } else {
//     insertAt =
//       targetPosition === 0
//         ? withoutOriginal.findIndex((t) => t.id === peers[0].id)
//         : withoutOriginal.findIndex(
//             (t) => t.id === peers[targetPosition - 1].id
//           ) + 1;
//   }
//   insertAt = Math.max(0, Math.min(withoutOriginal.length, insertAt));

//   const next = [
//     ...withoutOriginal.slice(0, insertAt),
//     updatedTask,
//     ...withoutOriginal.slice(insertAt),
//   ];

//   setTasks(next);
//   setActiveCard(null);

//     try {
//       if (!user?.sub)
//         return CustomToast({
//           variant: "error",
//           description: "User not authenticated",
//           duration: 3000,
//         });

//       await axios.patch(
//         `${API_BASE}/tasks`,
//         {
//           id: draggedTaskId,
//           userId: user.sub,
//           status: targetStatus,
//           completedAt:
//             targetStatus === STATUS_VALUES.COMPLETED
//               ? new Date().toISOString()
//               : undefined,
//         },
//         {
//           headers: { Authorization: `Bearer ${idToken} ` },
//         }
//       );
//       CustomToast({
//         variant: "success",
//         description: "Task Status Updated",
//         duration: 3000,
//       });
//     } catch (err: any) {
//       const message =
//         err.response?.data?.error || err.message || "Could not reach server";
//       CustomToast({ variant: "error", description: message, duration: 3000 });
//       console.error("Status update failed:", err);
//       setTasks(tasks);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-6 p-4 md:p-6 h-screen overflow-hidden">
//       <div className="flex justify-end">
//         <NewTaskForm
//           mode={isEditing ? "edit" : "create"}
//           initialTask={activeTask ?? undefined}
//           opened={isFormOpen}
//           onOpenChange={(open) => {
//             setIsFormOpen(open);
//             if (!open) {
//               setIsEditing(false);
//               setActiveTask(null);
//             }
//           }}
//           onCreate={(task) => {
//             if (isEditing) {
//               handleEditTask(task);
//             } else {
//               handleCreateTask(task);
//             }
//             setIsFormOpen(false);
//           }}
//         />
//       </div>

//       <div className="overflow-x-auto md:overflow-x-hidden flex md:grid px-4 scroll-smooth snap-x snap-mandatory md:grid-cols-3 pb-4 gap-4">
//         <Column
//           title="Planned"
//           icon={ListTodo}
//           statusValue={STATUS_VALUES.PLANNED}
//           tasks={todoTasks}
//           bgColor="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
//           shadowColor="shadow-purple-100/50 dark:shadow-purple-900/30"
//           onDeleteTask={handleDeleteTask}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//           activeCard={activeCard}
//           onClickTask={handleTaskClick}
//           onToggleChecklistItem={handleToggleChecklistItem}
//         />
//         <Column
//           title="In-Progress"
//           icon={Loader}
//           statusValue={STATUS_VALUES.IN_PROGRESS}
//           tasks={doingTasks}
//           bgColor="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
//           shadowColor="shadowcolor-amber-100/50 dark:shadow-amber-900/30"
//           onDeleteTask={handleDeleteTask}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//           activeCard={activeCard}
//           onClickTask={handleTaskClick}
//           onToggleChecklistItem={handleToggleChecklistItem}
//         />
//         <Column
//           title="Completed"
//           icon={CheckCircle}
//           statusValue={STATUS_VALUES.COMPLETED}
//           tasks={doneTasks}
//           bgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
//           shadowColor="shadow-emerald-100/50 dark:shadow-emerald-900/30"
//           onDeleteTask={handleDeleteTask}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//           activeCard={activeCard}
//           onClickTask={handleTaskClick}
//           onToggleChecklistItem={handleToggleChecklistItem}
//         />
//       </div>
//     </div>
//   );
// };

// export default TinuMind;