import { DonutChart } from "@/components/TaskManager_V2/Charts/PieChart";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	isToday,
	isThisWeek,
	isThisMonth,
	parseISO,
	subMonths,
} from "date-fns"; // Make sure subMonths is imported if used directly here
import { Calendar, Clock, CalendarDays, TrendingUp } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/Context/AuthContext";
import Spinner1 from "@/components/spinner";
import { TaskAttributes } from "@/types/TaskAttributes";
import { useArchiveManager } from "@/hooks/useArchiveManager";
import ArchiveManager from "@/components/TaskManager_V2/ArchiveManager/ArchiveManager";

const API_BASE = import.meta.env.VITE_API_URL;

interface DashboardTask {
	id: string;
	title: string;
	status: string;
	dueDate: string;
	archived?: boolean;
	archivedAt?: Date | string;
	completedAt?: Date | string;
}

interface TaskCardProps {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	tasks: DashboardTask[];
	bgColorClass: string;
	iconBgClass: string;
	textColorClass: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
	title,
	icon,
	tasks,
	bgColorClass,
	iconBgClass,
	textColorClass,
}) => {
	return (
		<div className={`p-6 rounded-xl shadow-md flex flex-col ${bgColorClass}`}>
			<div className="flex justify-between items-center mb-4">
				<h3 className={`text-xl font-semibold ${textColorClass}`}>{title}</h3>
				<div className={`p-2 rounded-lg ${iconBgClass}`}>
					{React.createElement(icon, {
						className: `h-6 w-6 ${textColorClass}`,
					})}
				</div>
			</div>
			<div className="flex items-center mb-1">
				<TrendingUp className={`h-5 w-5 mr-2 ${textColorClass}`} />
				<p className={`text-2xl font-bold ${textColorClass}`}>{tasks.length}</p>
				<p className={`ml-1 text-sm ${textColorClass}`}>tasks</p>
			</div>
			{tasks.length === 0 ? (
				<p className={`text-sm ${textColorClass} mt-4`}>No tasks due</p>
			) : (
				<div className="space-y-2 mt-2 overflow-y-auto custom-scrollbar max-h-36">
					{tasks.map((task) => (
						<div
							key={task.id}
							className="p-3 rounded-lg shadow flex justify-between items-center"
						>
							<span className="text-sm text-gray-700">{task.title}</span>
							<span
								className={`px-2 py-1 text-xs font-semibold rounded-full ${
									task.status.toLowerCase() === "in-progress"
										? "bg-amber-100 text-amber-700"
										: task.status.toLowerCase() === "completed"
										? "bg-emerald-100 text-emerald-700"
										: task.status.toLocaleLowerCase() === "planned"
										? "bg-purple-100 text-purple-700"
										: "bg-gray-100 text-gray-700"
								}`}
							>
								{task.status}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default function DashboardPage() {
	const { idToken, user } = useAuth();

	// State to hold ALL tasks fetched from the DB
	const [allTasks, setAllTasks] = useState<TaskAttributes[]>([]); // **INITIALIZED TO EMPTY ARRAY**
	const [tasksDueToday, setTasksDueToday] = useState<DashboardTask[]>([]);
	const [tasksDueThisWeek, setTasksDueThisWeek] = useState<DashboardTask[]>([]);
	const [tasksDueThisMonth, setTasksDueThisMonth] = useState<DashboardTask[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const updateTaskCallback = useCallback(
		async (taskId: string, updates: Partial<TaskAttributes>) => {
			setAllTasks((prev) =>
				prev.map((t) =>
					t.id === taskId
						? {
								...t,
								...updates,
								dueDate:
									updates.dueDate !== undefined
										? updates.dueDate instanceof Date
											? updates.dueDate
											: new Date(updates.dueDate)
										: t.dueDate,
								completedAt:
									updates.completedAt !== undefined
										? updates.completedAt instanceof Date
											? updates.completedAt
											: new Date(updates.completedAt)
										: t.completedAt,
								archivedAt:
									updates.archivedAt !== undefined
										? updates.archivedAt instanceof Date
											? updates.archivedAt
											: new Date(updates.archivedAt)
										: t.archivedAt,
						  }
						: t
				)
			);

			if (!user?.sub || !idToken) {
				console.error("User not authenticated. Cannot update task.");
				return;
			}

			const payload: Partial<TaskAttributes> & { id: string; userId: string } =
				{
					id: taskId,
					userId: user.sub,
					...updates,
				};
			if (payload.dueDate instanceof Date)
				payload.dueDate = payload.dueDate.toISOString();
			if (payload.completedAt instanceof Date)
				payload.completedAt = payload.completedAt.toISOString();
			if (payload.archivedAt instanceof Date)
				payload.archivedAt = payload.archivedAt.toISOString();

			try {
				await axios.patch(`${API_BASE}/tasks`, payload, {
					headers: { Authorization: `Bearer ${idToken}` },
				});
			} catch (error: any) {
				console.error(
					"Backend update failed from DashboardPage updateTaskCallback:",
					error
				);
			}
		},
		[setAllTasks, user?.sub, idToken]
	);

	const deleteTaskFromMainListCallback = useCallback(
		async (taskId: string) => {
			setAllTasks((prev) => prev.filter((t) => t.id !== taskId));

			if (!user?.sub || !idToken) {
				console.error("User not authenticated. Cannot delete task.");
				return;
			}

			try {
				await axios.delete(`${API_BASE}/tasks`, {
					headers: { Authorization: `Bearer ${idToken}` },
					data: { taskId, userId: user.sub },
				});
			} catch (error: any) {
				console.error(
					"Backend delete failed from DashboardPage deleteTaskFromMainListCallback:",
					error
				);
			}
		},
		[setAllTasks, user?.sub, idToken]
	);

	// CALL useArchiveManager FOR ITS SIDE EFFECTS ONLY
	// It will automatically trigger updateTaskCallback for archival
	useArchiveManager(
		allTasks, // Pass the main `allTasks` state to the hook
		updateTaskCallback,
		deleteTaskFromMainListCallback
	);

	// --- Filter archived tasks directly from allTasks for ArchiveManager prop ---
	const archivedTasks = allTasks.filter((task) => task.archived);

	console.log("[DashboardPage] All tasks fetched:", allTasks);
	console.log(
		"[DashboardPage] Archived tasks calculated in Dashboard:",
		archivedTasks
	);
	// --- End of Functions for useArchiveManager ---

	useEffect(() => {
		if (!user?.sub || !idToken) {
			setIsLoading(false);
			if (!user || !idToken) {
				setError("User not authenticated. Please log in.");
			}
			return;
		}

		const fetchAndProcessTasks = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await axios.get(`${API_BASE}/tasks`, {
					params: { userId: user.sub },
					headers: { Authorization: `Bearer ${idToken}` },
				});

				const fetchedTasksFromDB: TaskAttributes[] = response.data;

				// Normalize date fields to Date objects as soon as they are fetched
				const normalizedTasks: TaskAttributes[] = fetchedTasksFromDB.map(
					(dbTask) => ({
						...dbTask,
						dueDate: dbTask.dueDate ? new Date(dbTask.dueDate) : new Date(0),
						completedAt: dbTask.completedAt
							? new Date(dbTask.completedAt)
							: undefined,
						archivedAt: dbTask.archivedAt
							? new Date(dbTask.archivedAt)
							: undefined,
					})
				);

				setAllTasks(normalizedTasks); // Update the `allTasks` state

				const activeTasks = normalizedTasks.filter(
					(task) =>
						task.status &&
						task.status.toLowerCase() !== "completed" &&
						!task.archived
				);

				const dashboardFormattedTasks = activeTasks.map((task) => ({
					id: task.id,
					title: task.task,
					status: task.status,
					dueDate:
						task.dueDate instanceof Date
							? task.dueDate.toISOString()
							: task.dueDate,
				}));

				setTasksDueToday(
					dashboardFormattedTasks.filter(
						(task) => task.dueDate && isToday(parseISO(task.dueDate))
					)
				);
				setTasksDueThisWeek(
					dashboardFormattedTasks.filter(
						(task) =>
							task.dueDate &&
							isThisWeek(parseISO(task.dueDate), {
								weekStartsOn: 1 /* Monday */,
							})
					)
				);
				setTasksDueThisMonth(
					dashboardFormattedTasks.filter(
						(task) => task.dueDate && isThisMonth(parseISO(task.dueDate))
					)
				);
			} catch (err) {
				console.error("Failed to fetch tasks:", err);
				setError("Failed to load tasks. Please try again later.");
				setAllTasks([]); // Ensure allTasks is reset to empty array on error
			} finally {
				setIsLoading(false);
			}
		};

		fetchAndProcessTasks();
	}, [user, idToken]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Spinner1 />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen p-4">
				<p className="text-red-500 text-lg mb-4">{error}</p>
			</div>
		);
	}

	return (
		<div>
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<Separator orientation="vertical" className="mr-2 h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="#">Dashboard Overview</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
					<TaskCard
						title="Due Today"
						icon={Clock}
						tasks={tasksDueToday}
						bgColorClass="bg-red-50"
						iconBgClass="bg-red-100"
						textColorClass="text-red-600"
					/>
					<TaskCard
						title="Due This Week"
						icon={CalendarDays}
						tasks={tasksDueThisWeek}
						bgColorClass="bg-yellow-50"
						iconBgClass="bg-yellow-100"
						textColorClass="text-yellow-700"
					/>
					<TaskCard
						title="Due This Month"
						icon={Calendar}
						tasks={tasksDueThisMonth}
						bgColorClass="bg-blue-50"
						iconBgClass="bg-blue-100"
						textColorClass="text-blue-600"
					/>
				</div>
				<div className="flex flex-col gap-4 md:flex-row md:h-[600px]">
					<div className="flex-[2] h-full">
						<DonutChart />
					</div>
					<div className="flex-[1] h-full">
						<ArchiveManager
							tasks={archivedTasks}
							updateTask={updateTaskCallback}
							deleteTaskFromMainList={deleteTaskFromMainListCallback}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
