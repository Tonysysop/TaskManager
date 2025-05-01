
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

export interface TagType {
  name: string;
  color: string;
}

interface TaskTagProps {
  tag: TagType;
  className?: string;
}

const TaskTag = ({ tag, className }: TaskTagProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        tag.color,
        className
      )}
    >
      <Tag size={12} className="shrink-0" />
      <span>{tag.name}</span>
    </div>
  );
};

export default TaskTag;
