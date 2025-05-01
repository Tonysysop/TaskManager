
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

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
      <Circle size={12} className="shrink-0" />
      <span>{priority.name}</span>
    </div>
  );
};

export default TaskPriority;