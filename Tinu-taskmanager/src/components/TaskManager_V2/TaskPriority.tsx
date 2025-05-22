
import { cn } from '@/lib/utils';


function StatusDot({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  )
}

export interface PriorityType {
  name: string;
  color: string;
}

interface TaskTagProps {
  priority: PriorityType;
  className?: string;
}

const TaskPriority = ({ priority, className }: TaskTagProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        priority.color,
        className
      )}
			>
				<StatusDot className="shrink-0" />
				<span>{priority.name}</span>
			</div>
  );
};

export default TaskPriority;