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
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { Calendar, Clock, CalendarDays, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import { useAuth } from "@/Context/AuthContext";
import Spinner1 from "@/components/spinner";

const API_BASE = import.meta.env.VITE_API_URL;

interface Task {
	id: string;
	title: string; // Mapped from 'task' field in DB
	status: string;
	dueDate: string;
}

interface TaskCardProps {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	tasks: Task[];
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
										? "bg-amber-100 text-amber-700" // Handle potential case variations
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
	const { idToken, user } = useAuth(); // Get token and user info

	const [tasksDueToday, setTasksDueToday] = useState<Task[]>([]);
	const [tasksDueThisWeek, setTasksDueThisWeek] = useState<Task[]>([]);
	const [tasksDueThisMonth, setTasksDueThisMonth] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Only fetch if user and token are available
		if (!user?.sub || !idToken) {
			setIsLoading(false); // Not loading if no user/token
			if (!user || !idToken) {
				setError("User not authenticated. Please log in."); // Optional: set an error if auth details are missing
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

				// The actual tasks are likely in response.data
				const fetchedTasksFromDB: any[] = response.data;

				// Map database fields to our Task interface
				const mappedTasks: Task[] = fetchedTasksFromDB.map((dbTask) => ({
					id: dbTask.id, // Assuming the string id: "5a2a5f18-9a37-4f4f-9e58-40cf63f749e9"
					title: dbTask.task, // 'task' field from DB to 'title'
					status: dbTask.status,
					dueDate: dbTask.dueDate,
				}));

				const nonCompletedTasks = mappedTasks.filter(
					(task) => task.status && task.status.toLowerCase() !== "completed"
				);

				// Filter NON-COMPLETED tasks by due date
				setTasksDueToday(
					nonCompletedTasks.filter(
						(task) => task.dueDate && isToday(parseISO(task.dueDate))
					)
				);
				setTasksDueThisWeek(
					nonCompletedTasks.filter(
						(task) =>
							task.dueDate &&
							isThisWeek(parseISO(task.dueDate), {
								weekStartsOn: 1 /* Monday */,
							})
					)
				);
				setTasksDueThisMonth(
					nonCompletedTasks.filter(
						(task) => task.dueDate && isThisMonth(parseISO(task.dueDate))
					)
				);
			} catch (err) {
				console.error("Failed to fetch tasks:", err);
				setError("Failed to load tasks. Please try again later.");
				// You might want to inspect `err.response` for more specific API error details
			} finally {
				setIsLoading(false);
			}
		};

		fetchAndProcessTasks();
	}, [user, idToken]); // Re-run effect if user or idToken changes

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Spinner1 /> {/* Or a spinner component */}
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen p-4">
				<p className="text-red-500 text-lg mb-4">{error}</p>
				{/* Optionally, add a refresh button or login prompt */}
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
				<DonutChart />
				
			</div>
		</div>
	);
}
