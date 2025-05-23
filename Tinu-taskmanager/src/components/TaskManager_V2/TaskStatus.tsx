
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, CircleDot } from 'lucide-react';

type StatusType = 'Completed' | 'In-Progress' | 'Planned';

interface TaskStatusProps {
  status: StatusType;
  className?: string;
}

const TaskStatus = ({ status, className }: TaskStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300',
        };
      case 'In-Progress':
        return {
          icon: Clock,
          text: 'In-Progress',
          //text-amber-300 bg-amber-900/40
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300',
        };
      case 'Planned':
        return {
          icon: CircleDot,
          text: 'Planned',
          color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/40 dark:text-purple-300',
        };
      default:
        return {
          icon: CircleDot,
          text: 'Planned',
          color: 'text-purple-500 bg-purple-50',
        };
    }
  };

  const { icon: Icon, text, color } = getStatusConfig();

  return (
    <div className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit', color, className)}>
      <Icon size={14} className="shrink-0" />
      <span>{text}</span>
    </div>
  );
};

export default TaskStatus;
