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
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns"; // Make sure subMonths is imported if used directly here
import { Calendar, Clock, CalendarDays, TrendingUp } from "lucide-react";
import React, { useCallback } from "react";

import Spinner1 from "@/components/spinner";
import { TaskAttributes } from "@/types/TaskAttributes";
import { useArchiveManager } from "@/hooks/useArchiveManager";
import ArchiveManager from "@/components/TaskManager_V2/ArchiveManager/ArchiveManager";

import { useTasksData } from "@/hooks/useTaskQueries";

// 1. Define the fetch function (can be outside the component or in a separate api.js file)

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
              <span className="truncate text-xs sm:text-sm text-gray-700 max-w-[60%] sm:max-w-[60%]">
                {task.title}
              </span>
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
  // ------ for Dashboard cards
  const {
    tasks: allTasks,
    isLoadingTasks: isLoading,
    //isFetchError: isError,
    fetchError: error,
    updateTaskAsync, // Now directly available
    deleteTaskAsync, // Now directly available
  } = useTasksData();

  const updateTaskCallback = useCallback(
    async (taskId: string, updates: Partial<TaskAttributes>) => {
      // Call the updateTask mutation. We need to await its completion
      // if useArchiveManager is expecting a Promise to resolve.
      // useMutation's `mutate` function returns void. For awaiting, use `mutateAsync`.
      try {
        await updateTaskAsync({ taskId, updates });
        // No explicit toast here, as the mutation's onSuccess/onError handlers will do it
      } catch (err) {
        console.error("Error updating task via useTasksData hook:", err);
        // The onError handler in useTasksData will show a toast
      }
    },
    [updateTaskAsync] // Dependency on updateTaskAsync for useCallback
  );

  const deleteTaskFromMainListCallback = useCallback(
    async (taskId: string) => {
      // Call the deleteTask mutation. Similarly, use mutateAsync if awaiting is necessary.
      try {
        await deleteTaskAsync(taskId);
        // No explicit toast here, as the mutation's onSuccess/onError handlers will do it
      } catch (err) {
        console.error("Error deleting task via useTasksData hook:", err);
        // The onError handler in useTasksData will show a toast
      }
    },
    [deleteTaskAsync] // Dependency on deleteTaskAsync for useCallback
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

  const activeTasks = allTasks.filter(
    (task) =>
      task.status && task.status.toLowerCase() !== "completed" && !task.archived
  );

  // ---- Start of Dahboard cards function ----
  const dashboardFormattedTasks = activeTasks.map((task) => ({
    id: task.id,
    title: task.task,
    status: task.status,
    dueDate:
      task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
  }));

  const tasksDueToday = dashboardFormattedTasks.filter(
    (task) => task.dueDate && isToday(parseISO(task.dueDate))
  );

  const tasksDueThisWeek = dashboardFormattedTasks.filter(
    (task) =>
      task.dueDate && isThisWeek(parseISO(task.dueDate), { weekStartsOn: 1 })
  );

  const tasksDueThisMonth = dashboardFormattedTasks.filter(
    (task) => task.dueDate && isThisMonth(parseISO(task.dueDate))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner1 />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">Failed to load tasks.</p>;
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
