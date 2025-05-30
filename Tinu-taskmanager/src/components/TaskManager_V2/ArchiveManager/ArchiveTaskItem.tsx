import { Archive, Calendar, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskAttributes } from "@/types/TaskAttributes";
import TaskTag from "@/components/TaskManager_V2/TaskTag";

interface TaskItemProps {
	task: TaskAttributes;
	onArchive: (taskId: string) => void;
}

const TaskItem = ({ task, onArchive }: TaskItemProps) => {
	const now = new Date();
	const daysUntilArchive = task.completedAt
		? 60 - differenceInDays(now, task.completedAt)
		: 0;

	return (
		<div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:bg-background/70 transition-all duration-300 hover:shadow-md">
			<div className="space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<h4 className="font-medium text-foreground line-clamp-1">
							{task.task}
						</h4>
						<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
							{task.description}
						</p>
					</div>
					<div className="flex gap-1 shrink-0">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-amber-500"
							onClick={() => onArchive(task.id)}
						>
							<Archive size={16} />
						</Button>
					</div>
				</div>

				{task.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{task.tags.map((tag) => (
							<TaskTag key={tag.name} tag={tag} />
						))}
					</div>
				)}

				<div className="flex items-center justify-between text-xs">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1 text-muted-foreground">
							<Calendar size={12} />
							<span>Due: {format(task.dueDate, "MMM d, yyyy")}</span>
						</div>
						{task.completedAt && (
							<div className="flex items-center gap-1 text-emerald-600">
								<Clock size={12} />
								<span>
									Completed: {format(task.completedAt, "MMM d, yyyy")}
								</span>
							</div>
						)}
					</div>
					{daysUntilArchive > 0 && (
						<Badge variant="secondary" className="text-[10px]">
							{daysUntilArchive} days until auto-archive
						</Badge>
					)}
				</div>
			</div>
		</div>
	);
};

export default TaskItem;
