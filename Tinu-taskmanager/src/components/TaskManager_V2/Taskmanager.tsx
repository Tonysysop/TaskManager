// ./TaskManager.tsx (TinuMind component - API-backed on create)
import React, { useEffect, useMemo, useState } from "react";
import { ListTodo, Loader, CheckCircle } from "lucide-react";
import Column from "./Column"; // Adjust path if needed
import { TaskAttributes } from "@/types/TaskAttributes";
import NewTaskForm from "@/components/TaskManager_V2/taskform-new"; // Adjust path
import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast";
import LoaderUi from "./Loader";
import axios from "axios";
import { useAuth } from "@/Context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

const STATUS_VALUES = {
	PLANNED: "Planned",
	IN_PROGRESS: "In-Progress",
	COMPLETED: "Completed",
} as const;

type StatusValue = "Planned" | "In-Progress" | "Completed";

const TinuMind: React.FC = () => {
	const [userSub] = useState<string | null>(null);
	const [tasks, setTasks] = useState<TaskAttributes[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeCard, setActiveCard] = useState<TaskAttributes | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [activeTask, setActiveTask] = useState<TaskAttributes | null>(null); // Track active task
	const [isFormOpen, setIsFormOpen] = useState(false);

	// Load initial tasks/Get Task
	const { idToken, user } = useAuth();
	useEffect(() => {
		if (!user?.sub || !idToken) return;

		const fetchTasks = async () => {
			setIsLoading(true);
			try {
				const res = await axios.get<TaskAttributes[]>(`${API_BASE}/tasks`, {
					params: { userId: user?.sub },
					headers: { Authorization: `Bearer ${idToken} ` },
				});
				const data = res.data;

				setTasks(
					data.map((t) => ({
						...t,
						dueDate: t.dueDate ? new Date(t.dueDate) : new Date(0),
					}))
				);
			} catch (err: any) {
				console.error("Could not load tasks:", err);
				CustomToast({
					variant: "error",
					description: "Could not load tasks",
					duration: 3000,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchTasks();
	}, [user?.sub, idToken]);

	// Create task handler, passed to NewTaskForm
	const handleCreateTask = (newTask: TaskAttributes) => {
		if (!user?.sub) {
			CustomToast({
				variant: "error",
				description: "User not authenticated",
				duration: 3000,
			});
			return;
		}

		const payload = { ...newTask, userId: user?.sub };

		// Normalize dueDate like you do in your GET request
		const normalizedTask: TaskAttributes = {
			...newTask,
			dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(0),
		};

		// Optimistic UI update
		setTasks((prev) => [...prev, normalizedTask]);

		// Persist to backend using Axios
		axios
			.post(`${API_BASE}/tasks`, payload, {
				headers: { Authorization: `Bearer ${idToken} ` },
			})
			.then(() => {
				CustomToast({
					variant: "success",
					description: "Task created",
					duration: 3000,
				});
			})
			.catch((error) => {
				console.error("Error creating task:", error);
				// Revert optimistic update if the backend call fails
				setTasks((prev) => prev.filter((task) => task !== normalizedTask));
				CustomToast({
					variant: "error",
					description: "Failed to create task",
					duration: 3000,
				});
			});
	};

	const onDrop = async (
		draggedTaskId: string,
		targetStatus: StatusValue,
		targetPosition: number
	) => {
		console.log(
			`–– onDrop received → taskId: ${draggedTaskId}, status: ${targetStatus}, pos: ${targetPosition}`
		);

		const original = tasks.find((t) => t.id === draggedTaskId);
		if (!original) {
			setActiveCard(null);
			return;
		}

		const withoutOriginal = tasks.filter((t) => t.id !== draggedTaskId);
		const updatedTask: TaskAttributes = { ...original, status: targetStatus };
		const peers = withoutOriginal.filter((t) => t.status === targetStatus);

		let insertAt: number;
		if (peers.length === 0) {
			insertAt =
				withoutOriginal.findIndex((t) => t.status === targetStatus) || 0;
		} else {
			insertAt =
				targetPosition === 0
					? withoutOriginal.findIndex((t) => t.id === peers[0].id)
					: withoutOriginal.findIndex(
							(t) => t.id === peers[targetPosition - 1].id
					  ) + 1;
		}
		insertAt = Math.max(0, Math.min(withoutOriginal.length, insertAt));

		const next = [
			...withoutOriginal.slice(0, insertAt),
			updatedTask,
			...withoutOriginal.slice(insertAt),
		];

		setTasks(next);
		setActiveCard(null);

		// 🔁 Sync with backend
		try {
			// const userSub = localStorage.getItem('userSub');
			if (!user?.sub)
				return CustomToast({
					variant: "error",
					description: "User not authenticated",
					duration: 3000,
				});

			await axios.patch(
				`${API_BASE}/tasks`,
				{
					id: draggedTaskId,
					userId: user.sub,
					status: targetStatus,
				},
				{
					headers: { Authorization: `Bearer ${idToken} ` },
				}
			);
			CustomToast({
				variant: "success",
				description: "Task Status Updated",
				duration: 3000,
			});
		} catch (err: any) {
			const message =
				err.response?.data?.error || err.message || "Could not reach server";
			CustomToast({ variant: "error", description: message, duration: 3000 });
			console.error("Status update failed:", err);
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		if (!user?.sub) {
			CustomToast({
				variant: "error",
				description: "User not authenticated",
				duration: 3000,
			});
			return;
		}

		try {
			const res = await axios.delete(`${API_BASE}/tasks`, {
				headers: { Authorization: `Bearer ${idToken} ` },
				data: {
					taskId,
					userId: user.sub,
				},
			});
			console.log("taskID:", taskId, "userId", userSub);

			if (res.status >= 200 && res.status < 300) {
				setTasks((prev) => prev.filter((t) => t.id !== taskId));
				CustomToast({
					variant: "success",
					description: "Task Deleted Successfully",
					duration: 3000,
				});
			} else {
				CustomToast({
					variant: "error",
					description: (res.data as any).error || "Failed to delete task",
					duration: 3000,
				});
			}
		} catch (err: any) {
			const message =
				err.response?.data?.error || err.message || "Something went wrong";
			CustomToast({ variant: "error", description: message, duration: 3000 });
			console.error(err);
		}
	};

	// Handle task click for editing
	const handleTaskClick = (task: TaskAttributes) => {
		console.log("Task clicked:", task); //
		setActiveTask(task);
		setIsEditing(true); // Set to edit mode
		setIsFormOpen(true);
	};

	const todoTasks = useMemo(
		() => tasks.filter((t) => t.status === STATUS_VALUES.PLANNED),
		[tasks]
	);
	const doingTasks = useMemo(
		() => tasks.filter((t) => t.status === STATUS_VALUES.IN_PROGRESS),
		[tasks]
	);
	const doneTasks = useMemo(
		() => tasks.filter((t) => t.status === STATUS_VALUES.COMPLETED),
		[tasks]
	);

	if (isLoading) return <LoaderUi />;

	/** Edit */
	const handleEditTask = async (updatedTask: TaskAttributes) => {
		if (!user?.sub) {
			CustomToast({
				variant: "error",
				description: "User not authenticated",
				duration: 3000,
			});
			return;
		}

		// 1️⃣ Optimistically update UI
		setTasks((prev) =>
			prev.map((t) =>
				t.id === updatedTask.id
					? { ...updatedTask, dueDate: new Date(updatedTask.dueDate) }
					: t
			)
		);
		setIsEditing(false);

		try {
			// Normalize dueDate to ISO:
			const isoDueDate = new Date(updatedTask.dueDate).toISOString();

			const patchPayload = {
				id: updatedTask.id,
				userId: user.sub,
				task: updatedTask.task,
				status: updatedTask.status,
				priority: updatedTask.priority,
				dueDate: isoDueDate,
				description: updatedTask.description,
				checklist: updatedTask.checklist,
				showDescriptionOnCard: updatedTask.showDescriptionOnCard,
				showChecklistOnCard: updatedTask.showChecklistOnCard,
				tags: updatedTask.tags,
			};

			await axios.patch(`${API_BASE}/tasks`, patchPayload, {
				headers: { Authorization: `Bearer ${idToken}` },
			});

			CustomToast({
				variant: "success",
				description: "Task updated",
				duration: 3000,
			});
		} catch (err: any) {
			console.error("Update failed", err);
			CustomToast({
				variant: "error",
				description: err.response?.data?.error || "Failed to update task",
				duration: 3000,
			});
			// Roll back on error
			setTasks((prev) =>
				prev.map((t) => (t.id === updatedTask.id ? activeTask! : t))
			);
		}
	};

	const handleToggleChecklistItem = async (
		// Make it async
		taskId: string,
		itemId: string,
		checked: boolean
	) => {
		let updatedTaskForBackend: TaskAttributes | undefined;

		// 1. Update local state and capture the updated task
		setTasks((prevTasks) =>
			prevTasks.map((task) => {
				if (task.id === taskId) {
					const newChecklist = task.checklist?.map((item) =>
						item.id === itemId ? { ...item, completed: checked } : item
					);
					updatedTaskForBackend = {
						// Capture the fully updated task
						...task,
						checklist: newChecklist,
					};
					return updatedTaskForBackend;
				}
				return task;
			})
		);

		// 2. If the task was found and updated, persist to backend
		if (updatedTaskForBackend && user?.sub && idToken) {
			try {
				// Prepare only the necessary fields for the patch payload
				// Your backend might only need the checklist, or the whole task
				const patchPayload = {
					id: updatedTaskForBackend.id,
					userId: user.sub,
					checklist: updatedTaskForBackend.checklist, // Send the updated checklist
					// You might need to send other fields if your backend expects them
					// or if other logic relies on a full task update.
					// For example, if you want to be consistent with handleEditTask:
					// task: updatedTaskForBackend.task,
					// status: updatedTaskForBackend.status,
					// priority: updatedTaskForBackend.priority,
					// dueDate: new Date(updatedTaskForBackend.dueDate).toISOString(),
					// description: updatedTaskForBackend.description,
					// showDescriptionOnCard: updatedTaskForBackend.showDescriptionOnCard,
					// showChecklistOnCard: updatedTaskForBackend.showChecklistOnCard,
					// tags: updatedTaskForBackend.tags,
				};

				await axios.patch(`${API_BASE}/tasks`, patchPayload, {
					headers: { Authorization: `Bearer ${idToken}` },
				});

				// Optional: Show a success toast
				CustomToast({
					variant: "success",
					description: "Checklist item updated.",
					duration: 2000,
				});
			} catch (err: any) {
				console.error("Checklist update failed", err);
				CustomToast({
					variant: "error",
					description:
						err.response?.data?.error || "Failed to update checklist item.",
					duration: 3000,
				});
				// Optional: Roll back the optimistic update if the API call fails
				// This would involve refetching tasks or reverting to the previous state
				// For simplicity, this example doesn't include a full rollback here,
				// but you have it in handleEditTask as a reference.
				setTasks((prevTasks) =>
					prevTasks.map((task) =>
						task.id === taskId
							? {
									...task,
									checklist: task.checklist?.map(
										(item) =>
											item.id === itemId
												? { ...item, completed: !checked }
												: item // Revert the change
									),
							  }
							: task
					)
				);
			}
		} else if (!user?.sub || !idToken) {
			CustomToast({
				variant: "error",
				description: "User not authenticated. Cannot update checklist.",
				duration: 3000,
			});
		}
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
							// reset edit mode when you close
							setIsEditing(false);
							setActiveTask(null);
						}
					}}
					onCreate={(task) => {
						if (isEditing) {
							// call your update API
							handleEditTask(task);
						} else {
							handleCreateTask(task);
						}
						setIsFormOpen(false);
					}}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0  ">
				<Column
					title="Planned"
					icon={ListTodo}
					statusValue={STATUS_VALUES.PLANNED}
					tasks={todoTasks}
					bgColor="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
					shadowColor="shadow-purple-100/50 dark:shadow-purple-900/30"
					onDeleteTask={handleDeleteTask}
					setActiveCard={setActiveCard}
					onDrop={onDrop}
					activeCard={activeCard}
					onClickTask={handleTaskClick} // Pass the click handler
					onToggleChecklistItem={handleToggleChecklistItem}
				/>
				<Column
					title="In-Progress"
					icon={Loader}
					statusValue={STATUS_VALUES.IN_PROGRESS}
					tasks={doingTasks}
					bgColor="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
					shadowColor="shadowcolor-amber-100/50 dark:shadow-amber-900/30"
					onDeleteTask={handleDeleteTask}
					setActiveCard={setActiveCard}
					onDrop={onDrop}
					activeCard={activeCard}
					onClickTask={handleTaskClick} // Pass the click handler
					onToggleChecklistItem={handleToggleChecklistItem}
				/>
				<Column
					title="Completed"
					icon={CheckCircle}
					statusValue={STATUS_VALUES.COMPLETED}
					tasks={doneTasks}
					bgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
					shadowColor="shadow-emerald-100/50 dark:shadow-emerald-900/30"
					onDeleteTask={handleDeleteTask}
					setActiveCard={setActiveCard}
					onDrop={onDrop}
					activeCard={activeCard}
					onClickTask={handleTaskClick} // Pass the click handler
					onToggleChecklistItem={handleToggleChecklistItem}
				/>
			</div>
		</div>
	);
};

export default TinuMind;

// // ./TaskManager.tsx (TinuMind component - Updated)
// //import { startTransition } from 'react';
// import { useEffect, useMemo, useState } from 'react';
// import { ListTodo, Loader, CheckCircle } from 'lucide-react';
// import Column from './Column'; // Adjust path if needed
// import { TaskAttributes } from '@/types/TaskAttributes';
// import NewTaskForm from "@/components/TaskManager_V2/taskform-new"; // Adjust path
// import { fetchAuthSession } from "aws-amplify/auth";
// import { toast } from "sonner";

// const API_BASE = process.env.REACT_APP_API_URL;

// // Define status values using 'as const' for stricter type checking
// const STATUS_VALUES = {
//     PLANNED: 'planned',
//     IN_PROGRESS: 'in-progress',
//     COMPLETED: 'completed',
// } as const;

// type StatusValue = 'planned' | 'in-progress' | 'completed';

// // --- Helper Functions ---
// const getCurrentUserEmail = async (): Promise<string | null> => {
//     try {
//         const session = await fetchAuthSession();
//         return (session.tokens?.idToken?.payload?.email as string | null) ?? null;
//     } catch (error) {
//         console.error("Failed to get user email:", error);
//         toast.error("Failed to load user email", { description: "Please try again later." });
//         return null;
//     }
// };
// // Safely parse tasks from JSON, ensuring dates are handled
// const parseTasks = (jsonString: string | null): TaskAttributes[] => {
//     if (!jsonString) return [];
//     try {
//         const parsed = JSON.parse(jsonString);
//         if (!Array.isArray(parsed)) {
//             console.warn("Stored tasks data is not an array, resetting.");
//             return [];
//         }
//         // Ensure each task has an id and map dates correctly
//         return parsed.map((task: any) => ({
//             ...task,
//             id: task.id ?? crypto.randomUUID(), // Assign ID if missing (consider better ID generation)
//             dueDate: task.dueDate ? new Date(task.dueDate) : null, // Convert string back to Date object
//             // Ensure other required fields exist or have defaults
//             task: task.task ?? 'Untitled Task',
//             status: task.status ?? STATUS_VALUES.PLANNED,
//             priority: task.priority ?? 'Normal',
//             description: task.description ?? '',
//             tags: task.tags ?? [],
//         })).filter(task => Object.values(STATUS_VALUES).includes(task.status)); // Filter out tasks with invalid status
//     } catch (error) {
//         console.error("Failed to parse tasks from localStorage:", error);
//         return [];
//     }
// };
// // --- Component ---
// const TinuMind = () => {
//   const [userEmail, setUserEmail] = useState<string | null>(null);
//   const [tasks, setTasks] = useState<TaskAttributes[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

//   // State for visual feedback during drag (task object)
//   const [activeCard, setActiveCard] = useState<TaskAttributes | null>(null);

//   // Effect for loading tasks on mount
//   useEffect(() => {
//     let isMounted = true;
//     const loadInitialTasks = async () => {
//       setIsLoading(true);
//       const email = await getCurrentUserEmail();
//       if (!isMounted) return;

//       setUserEmail(email);
//       const storageKey = email ? `tasks-${email}` : "tasks"; // Fallback to generic key
//       const savedTasksString = localStorage.getItem(storageKey);
//       const loadedTasks = parseTasks(savedTasksString);

//       if (isMounted) {
//         setTasks(loadedTasks);
//         setIsLoading(false);
//         if (email) {
//              localStorage.setItem('lastUserEmail', email); // Remember for potential faster load next time
//           }
//         }
//     };
//     loadInitialTasks();
//     return () => { isMounted = false; }; // Cleanup on unmount
//   }, []);

//   // Effect for saving tasks when they change
//   useEffect(() => {
//     // Avoid saving during initial load or if tasks haven't changed meaningfully
//     if (isLoading) return;
//     const storageKey = userEmail ? `tasks-${userEmail}` : "tasks";
//     localStorage.setItem(storageKey, JSON.stringify(tasks));
//   }, [tasks, userEmail, isLoading]); // Depend on isLoading to prevent premature saves

//   // Filter tasks for each column (memoize if performance becomes an issue)
//   const todoTasks = useMemo(() => tasks.filter(task => task.status === STATUS_VALUES.PLANNED), [tasks]);
//   const doingTasks = useMemo(() => tasks.filter(task => task.status === STATUS_VALUES.IN_PROGRESS), [tasks]);
//   const doneTasks = useMemo(() => tasks.filter(task => task.status === STATUS_VALUES.COMPLETED), [tasks]);

//   // Handler for deleting a task
//   const handleDeleteTask = (taskId: string) => {
//     setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
//     toast.success("Task deleted", {
//       description: "The task has been removed from your list",
//     });
//   };

//   const onDrop = (
//   draggedTaskId: string,
//   targetStatus: StatusValue,
//   targetPosition: number
// ) => {
//   console.log(
//     `–– onDrop received → taskId: ${draggedTaskId}, status: ${targetStatus}, pos: ${targetPosition}`
//   );

//   // 1) Find the original task
//   const original = tasks.find((t) => t.id === draggedTaskId);
//   if (!original) {
//     console.error("❌ onDrop: dragged task not found", draggedTaskId);
//     setActiveCard(null);
//     return;
//   }

//   // 2) Early exit if status & effective position didn’t change
//   if (
//     original.status === targetStatus &&
//     (() => {
//       const sameCol = tasks.filter((t) => t.status === targetStatus);
//       const idx = sameCol.findIndex((t) => t.id === draggedTaskId);
//       return idx === targetPosition || idx + 1 === targetPosition;
//     })()
//   ) {
//     console.log("↩️ onDrop: no change in status/position");
//     setActiveCard(null);
//     return;
//   }

//   // 3) Build new array without the dragged task
//   const withoutOriginal = tasks.filter((t) => t.id !== draggedTaskId);
//   const updatedTask: TaskAttributes = { ...original, status: targetStatus };

//   // 4) Compute insertion index in the full array
//   const peers = withoutOriginal.filter((t) => t.status === targetStatus);
//   let insertAt: number;

//   if (peers.length === 0) {
//     // If column is empty, drop at top
//     const firstIndex = withoutOriginal.findIndex((t) => t.status === targetStatus);
//     insertAt = Math.max(0, firstIndex);
//   } else {
//     if (targetPosition === 0) {
//       // Before the first peer
//       insertAt = withoutOriginal.findIndex((t) => t.id === peers[0].id);
//     } else {
//       // After the (position-1)th peer
//       const beforePeer = peers[targetPosition - 1];
//       const idx = withoutOriginal.findIndex((t) => t.id === beforePeer.id);
//       insertAt = idx + 1;
//     }
//   }

//   // 5) Clamp into [0, withoutOriginal.length]
//   insertAt = Math.min(Math.max(0, insertAt), withoutOriginal.length);
//   console.log(`→ Inserting at absolute index: ${insertAt}`);

//   // 6) Construct and set new state
//   const next = [
//     ...withoutOriginal.slice(0, insertAt),
//     updatedTask,
//     ...withoutOriginal.slice(insertAt),
//   ];
//   console.log("→ New task order:", next.map((t) => t.id).join(", "));

//   setTasks(next);
//   setActiveCard(null);
// };

//   // Render Loading or Task Board
//   if (isLoading) {
//     return <div className="flex justify-center items-center h-screen">Loading tasks...</div>; // Or a spinner component
//   }

//   return (
//     // Main container - control height and prevent body scroll
//     <div className="flex flex-col gap-6 p-4 md:p-6 h-screen overflow-hidden">
//       <div className="flex justify-end">
//     <NewTaskForm onCreate={setTasks} />
//   </div>
//       {/* Grid container for columns - takes remaining space */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
//         {/* Pass props to each Column */}
//         <Column
//           title="Todo"
//           icon={ListTodo}
//           statusValue={STATUS_VALUES.PLANNED} // Pass internal status value
//           tasks={todoTasks}
//           bgColor="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
//           shadowColor="shadow-purple-100/50 dark:shadow-purple-900/30"
//           onDeleteTask={handleDeleteTask}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop} // Pass the main handler
//           activeCard={activeCard}
//         />
//         <Column
//           title="In Progress"
//           icon={Loader}
//           statusValue={STATUS_VALUES.IN_PROGRESS}
//           tasks={doingTasks}
//           bgColor="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
//           shadowColor="shadow-amber-100/50 dark:shadow-amber-900/30"
//           onDeleteTask={handleDeleteTask}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//           activeCard={activeCard}
//         />
//         <Column
//           title="Done"
//           icon={CheckCircle}
//           statusValue={STATUS_VALUES.COMPLETED}
//           tasks={doneTasks}
//           bgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
//           shadowColor="shadow-emerald-100/50 dark:shadow-emerald-900/30"
//           onDeleteTask={handleDeleteTask}
//           setActiveCard={setActiveCard}
//           onDrop={onDrop}
//           activeCard={activeCard}
//         />
//       </div>
//     </div>
//   );
// };

// export default TinuMind;
