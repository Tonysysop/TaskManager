
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, CircleDot } from 'lucide-react';

type StatusType = 'completed' | 'in-progress' | 'planned';

interface TaskStatusProps {
  status: StatusType;
  className?: string;
}

const TaskStatus = ({ status, className }: TaskStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          color: 'text-emerald-500 bg-emerald-50',
        };
      case 'in-progress':
        return {
          icon: Clock,
          text: 'In Progress',
          color: 'text-amber-500 bg-amber-50',
        };
      case 'planned':
        return {
          icon: CircleDot,
          text: 'Planned',
          color: 'text-purple-500 bg-purple-50',
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
