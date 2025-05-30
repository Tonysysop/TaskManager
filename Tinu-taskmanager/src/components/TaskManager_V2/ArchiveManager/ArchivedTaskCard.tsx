import {
	Archive,
	ArchiveRestore,
	BadgeCheck,
	Calendar,
	Clock,
	Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TaskAttributes } from "@/types/TaskAttributes";
import TaskTag from "@/components/TaskManager_V2/TaskTag";
import TaskStatus from "@/components/TaskManager_V2/TaskStatus";
import TaskPriority from "../TaskPriority";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ArchivedTaskCardProps {
	task: TaskAttributes;
	onUnarchive: (taskId: string) => void;
	onDelete: (taskId: string) => void;
}

const ArchivedTaskCard = ({
	task,
	onUnarchive,
	onDelete,
}: ArchivedTaskCardProps) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const getPriorityColor = () => {
		switch (task.priority) {
			case "Critical":
				return "text-red-600";
			case "Urgent":
				return "text-yellow-500";
			case "Normal":
				return "text-blue-500";
			case "No Rush":
				return "text-emerald-500";
			default:
				return "text-gray-500";
		}
	};

	return (
		<>
			<div
				className={cn(
					"bg-card border border-border rounded-lg p-4 shadow-md transition-all duration-300",
					"shadow-emerald-100 dark:shadow-emerald-900/40",
					"animate-fade-in hover:shadow-lg"
				)}
			>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-foreground line-clamp-1">
							{task.task}
						</h3>
						<div className="flex gap-1">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-blue-500 cursor-pointer"
								onClick={() => onUnarchive(task.id)}
								title="Unarchive task"
							>
								<ArchiveRestore size={16} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
								onClick={() => setIsDialogOpen(true)}
								title="Delete task"
							>
								<Trash2 size={16} />
							</Button>
						</div>
					</div>

					<div className="flex items-center gap-1">
						<TaskStatus status={task.status} />
						<TaskPriority
							priority={{
								name: task.priority,
								color: getPriorityColor(),
							}}
							className="px-1 py-0"
						/>
					</div>

					{task.showDescriptionOnCard && task.description && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-tight cursor-help">
										{task.description || "No description"}
									</p>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									align="center"
									className={cn(
										"max-w-xs whitespace-normal break-words p-2 text-emerald-900 bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100"
									)}
								>
									<p className="text-xs">{task.description}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}

					{task.showChecklistOnCard && task.checklist?.length ? (
						<div className="space-y-1">
							<div className="flex items-center gap-1 text-sm text-muted-foreground">
								<BadgeCheck className="w-4 h-4" />
								<span>
									{task.checklist.filter((item) => item.completed).length} /{" "}
									{task.checklist.length}
								</span>
							</div>
							<ul className="space-y-1">
								{task.checklist.map((item) => (
									<li
										key={item.id}
										className="flex text-muted-foreground items-center gap-2 text-sm"
									>
										<Checkbox
											className=" data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-gray-400 dark:data-[state=checked]:bg-purple-600 dark:data-[state=checked]:border-purple-600 dark:data-[state=unchecked]:bg-transparent dark:data-[state=unchecked]:border-gray-500"
											checked={item.completed}
										/>
										<span
											className={cn(
												item.completed && "line-through text-muted-foreground"
											)}
										>
											{item.text}
										</span>
									</li>
								))}
							</ul>
						</div>
					) : null}

					{task.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{task.tags.map((tag) => (
								<TaskTag key={tag.name} tag={tag} />
							))}
						</div>
					)}

					<div className="space-y-2">
						{task.completedAt && (
							<div className="flex items-center text-xs text-emerald-600">
								<Clock size={14} className="mr-1.5" />
								<span>Completed: {format(task.completedAt, "MMM d, yyyy")}</span>
							</div>
						)}
						{task.archivedAt && (
							<div className="flex items-center text-xs text-muted-foreground">
								<Archive size={14} className="mr-1.5" />
								<span>Archived: {format(task.archivedAt, "MMM d, yyyy")}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete task?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this task? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90 cursor-pointer"
							onClick={() => {
								onDelete(task.id);
								setIsDialogOpen(false);
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default ArchivedTaskCard;
