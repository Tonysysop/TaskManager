import React from "react"; // Ensure React is imported
import { Calendar, Trash2, BadgeCheck } from "lucide-react";
import { format, formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import TaskStatus from "@/components/TaskManager_V2/TaskStatus";
import TaskTag from "@/components/TaskManager_V2/TaskTag";
import { Button } from "@/components/ui/button";
import { TaskAttributes } from "@/types/TaskAttributes";
import TaskPriority from "./TaskPriority";
import { Checkbox } from "@/components/ui/checkbox";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
	task: TaskAttributes;
	onDelete: () => void;
	columnType: string; // This will receive the statusValue ('planned', 'in-progress', etc.)
	className?: string;
	setActiveCard: (task: TaskAttributes | null) => void; // For visual feedback
	activeCard: TaskAttributes | null; // To check if this card is being dragged
	onClick: () => void;
	handleChecklistToggle: (id: string, checked: boolean) => void;
}

const TaskCard = ({
	task,
	onDelete,
	columnType,
	className,
	setActiveCard,
	activeCard,
	onClick,
	handleChecklistToggle,
}: TaskCardProps) => {
	const [isDragging, setIsDragging] = React.useState(false);

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		setActiveCard(task);
		e.dataTransfer.setData("text/plain", task.id);
		e.dataTransfer.effectAllowed = "move";
		setIsDragging(true);
	};

	const handleDragEnd = () => {
		setActiveCard(null);
		setIsDragging(false);
	};

	const handleClick = () => {
		// Only trigger onClick if not currently dragging
		if (!isDragging) {
			onClick();
		}
	};

	const onChecklistItemToggle = (itemId: string, checked: boolean) => {
		handleChecklistToggle(itemId, checked);
	};

	const isOverdue =
		task.dueDate instanceof Date &&
		task.dueDate < new Date() &&
		task.status !== "Completed";

	const getShadowColor = () => {
		switch (columnType) {
			case "Planned":
				return "shadow-purple-100 dark:shadow-purple-900/20";
			case "In-Progress":
				return "shadow-amber-100 dark:shadow-amber-900/20";
			case "Completed":
				return "shadow-emerald-100 dark:shadow-emerald-900/20";
			default:
				return "shadow-gray-100 dark:shadow-gray-900/20";
		}
	};

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

	const getChecklistBadgeColor = () => {
		switch (columnType) {
			case "Planned":
				return "text-purple-500";
			case "In-Progress":
				return "text-amber-500";
			case "Completed":
				return "text-emerald-500";
			default:
				return "";
		}
	};

	const TooltipBackgroundColor = () => {
		switch (columnType) {
			case "Planned":
				return "text-purple-900 bg-purple-200 dark:bg-purple-900 dark:text-purple-200";
			case "In-Progress":
				return "text-amber-900 bg-amber-200 dark:bg-amber-900 dark:text-amber-300";
			case "Completed":
				return "text-emerald-900 bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100";
			default:
				return "bg-gray-700"; // A default background color
		}
	};

	const formattedDueDate =
		task.dueDate instanceof Date
			? format(task.dueDate, "MMM d, yyyy")
			: "No due date";

	return (
		<div
			className={cn(
				"bg-card border border-border rounded-lg p-4 shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing",
				getShadowColor(),
				activeCard?.id === task.id
					? "opacity-50 scale-95 ring-2 ring-primary shadow-lg"
					: "",
				className
			)}
			draggable
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onClick={handleClick}
		>
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-foreground line-clamp-1">
						{task.task}
					</h3>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
								onClick={(e) => e.stopPropagation()}
							>
								<Trash2 size={16} />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent onClick={(e) => e.stopPropagation()}>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete task?</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this task? This action cannot
									be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="cursor-pointer">
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									className="bg-destructive hover:bg-destructive/90 cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										onDelete();
									}}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
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

				{/* Conditionally render description based on showDescriptionOnCard */}
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
									"max-w-xs whitespace-normal break-words p-2",
									TooltipBackgroundColor()
								)}
							>
								<p className="text-xs">{task.description}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}

				{/* Conditionally render checklist based on showChecklistOnCard */}
				{task.showChecklistOnCard && task.checklist?.length ? (
					<div className="space-y-1" onClick={(e) => e.stopPropagation()}>
						{/* Progress Row */}
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<BadgeCheck className={cn("w-4 h-4", getChecklistBadgeColor())} />
							<span>
								{task.checklist.filter((item) => item.completed).length} /{" "}
								{task.checklist.length}
							</span>
						</div>

						{/* Checklist */}
						<ul className="space-y-1">
							{task.checklist.map((item) => (
								<li
									key={item.id}
									className="flex text-muted-foreground items-center gap-2 text-sm"
								>
									<Checkbox
										className="cursor-pointer data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-gray-400 dark:data-[state=checked]:bg-purple-600 dark:data-[state=checked]:border-purple-600 dark:data-[state=unchecked]:bg-transparent dark:data-[state=unchecked]:border-gray-500"
										checked={item.completed}
										onCheckedChange={(checked) =>
											onChecklistItemToggle(item.id, checked as boolean)
										}
										draggable={false}
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

				{task.tags?.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{task.tags.map((tag) => (
							<TaskTag key={tag.name} tag={tag} />
						))}
					</div>
				)}

				<div
					className={cn(
						"flex items-center text-xs font-medium mt-2",
						task.status === "Completed"
							? "text-green-600"
							: task.dueDate && isOverdue
							? "text-destructive"
							: "text-muted-foreground"
					)}
				>
					<Calendar size={14} className="mr-1.5" />
					<span>
						{task.status === "Completed" && task.completedAt
							? `Completed: ${formatDate(task.completedAt, "MMM d, yyyy")}`
							: task.dueDate
							? `${isOverdue ? "Overdue: " : "Due: "}${formattedDueDate}`
							: ""}
					</span>
				</div>
			</div>
		</div>
	);
};

export default TaskCard;
