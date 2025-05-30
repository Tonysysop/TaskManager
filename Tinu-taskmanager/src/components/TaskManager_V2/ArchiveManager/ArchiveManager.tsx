// src/components/ArchiveManager.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { TaskAttributes } from "@/types/TaskAttributes";
import ArchivedTaskCard from "./ArchivedTaskCard"; // Assuming you have this component
import ArchiveStats from "./ArchiveStats"; // Assuming you have this component
import { useArchiveManager } from "@/hooks/useArchiveManager"; // Your hook
import { toast } from "sonner"; // Your toast notification library

const STATUS_VALUES = {
	PLANNED: "Planned",
	IN_PROGRESS: "In-Progress",
	COMPLETED: "Completed",
} as const;

interface ArchiveManagerProps {
	tasks: TaskAttributes[];
	updateTask: (
		taskId: string,
		updates: Partial<TaskAttributes>
	) => Promise<void>;
	deleteTaskFromMainList: (taskId: string) => Promise<void>;
}

const ArchiveManager = ({
	tasks,
	updateTask,
	deleteTaskFromMainList,
}: ArchiveManagerProps) => {
	// This hook is called for its side effects (auto-archiving)
	useArchiveManager(tasks, updateTask, deleteTaskFromMainList);

	const [showArchived, setShowArchived] = useState(false);

	// Filter tasks for display in this component
	const archivedTasks = tasks.filter((task) => task.archived);

	const handleUnarchive = async (taskId: string) => {
		await updateTask(taskId, {
			archived: false,
			archivedAt: undefined, // Clear the archivedAt timestamp
			status: STATUS_VALUES.IN_PROGRESS, // <--- KEY CHANGE: Move to In-Progress
			completedAt: undefined, // <--- KEY CHANGE: Clear completedAt, as it's no longer completed
		});
		toast.success("Task unarchived and moved to 'In-Progress'!", {
			position: "bottom-right",
			duration: 3000,
		});
	};

	const handleDeleteArchived = async (taskId: string) => {
		const task = archivedTasks.find((t) => t.id === taskId); // Find the task for toast message
		await deleteTaskFromMainList(taskId);
		toast.success(`"${task?.task}" permanently deleted.`, {
			position: "bottom-right",
			duration: 2000,
		});
	};

	return (
		<Card className=" border shadow-lg h-full">
			<CardHeader className="space-y-1">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Archive className="h-5 w-5 text-slate-600 dark:text-slate-400" />
						Archive Manager
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowArchived(!showArchived)}
						className="gap-2"
					>
						{showArchived ? <EyeOff size={14} /> : <Eye size={14} />}
						{showArchived ? "Hide" : "Show"}
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">
					Completed tasks are automatically archived 2 months after their
					completion date.
				</p>
			</CardHeader>

			<CardContent className="space-y-6 flex flex-col flex-grow min-h-0">
				{showArchived ? (
					<>
						<ArchiveStats
							eligibleCount={0}
							archivedCount={archivedTasks.length}
							title="Archived Tasks"
						/>
						{archivedTasks.length === 0 ? (
							<div className="flex items-center justify-center flex-grow text-sm text-muted-foreground italic">
								No archived tasks yet
							</div>
						) : (
							// ScrollArea fills remaining space but scrolls internally
							<ScrollArea className="flex-grow min-h-0 overflow-visible relative">
								<div className="grid gap-3 pr-3">
									{archivedTasks.map((task) => (
										<div key={task.id} className="w-full max-w-sm relative">
											<ArchivedTaskCard
												task={task}
												onUnarchive={handleUnarchive}
												onDelete={handleDeleteArchived}
											/>
										</div>
									))}
								</div>
							</ScrollArea>
						)}
					</>
				) : (
					<div className="flex items-center justify-center h-32 text-sm text-muted-foreground italic">
						Click "Show Archived" to view archived tasks.
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ArchiveManager;
