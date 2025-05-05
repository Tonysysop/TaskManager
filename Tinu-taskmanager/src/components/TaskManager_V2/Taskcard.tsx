// ./TaskCard.tsx (Updated)
import React from 'react'; // Ensure React is imported
import { Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import TaskStatus from '@/components/TaskManager_V2/TaskStatus';
import TaskTag from '@/components/TaskManager_V2/TaskTag';
import { Button } from '@/components/ui/button';
import { TaskAttributes } from '@/types/TaskAttributes';
import TaskPriority from './TaskPriority';
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
}

const TaskCard = ({
  task,
  onDelete,
  columnType,
  className,
  setActiveCard,
  activeCard,
}: TaskCardProps) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set visual feedback state
    setActiveCard(task);

    // --- REQUIRED: Set dataTransfer for DropArea to read ---
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };
  

  const handleDragEnd = () => {
    // Clear visual feedback state
    setActiveCard(null);
  };

  // Safer check for overdue status
  const isOverdue = task.dueDate instanceof Date && task.dueDate < new Date() && task.status !== 'completed';

  const getShadowColor = () => {
    switch (columnType) { // Use the statusValue passed as columnType
      case 'planned': return 'shadow-purple-100 dark:shadow-purple-900/20';
      case 'in-progress': return 'shadow-amber-100 dark:shadow-amber-900/20';
      case 'completed': return 'shadow-emerald-100 dark:shadow-emerald-900/20';
      default: return 'shadow-gray-100 dark:shadow-gray-900/20';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'Critical': return 'text-red-600';
      case 'Urgent': return 'text-yellow-500';
      case 'Normal': return 'text-blue-500';
      case 'No Rush': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  // Safely format the date
  const formattedDueDate = task.dueDate instanceof Date
    ? format(task.dueDate, 'MMM d, yyyy') // Use 'yyyy' for 4-digit year
    : 'No due date';

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing',
        getShadowColor(),
        activeCard?.id === task.id ? 'opacity-50 scale-95' : '', // Apply dragging styles
        className
      )}
      draggable // Enable drag
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground line-clamp-1">{task.task}</h3>
          <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete task?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={onDelete}
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
        <TooltipProvider>
          <Tooltip>
         {/* This is the element that you hover over */}
            <TooltipTrigger asChild>
              <p
                  className="text-sm text-muted-foreground line-clamp-2 font-medium leading-tight cursor-help"
                >
                  {task.description || "No description"}
                </p>
            </TooltipTrigger>

           {/* This is the floating tooltip box */}
            <TooltipContent 
              side="top" 
              align="center"
              className="
                max-w-xs            
                whitespace-normal   
                break-words           
                p-2                 
              "
            > 
              
              
              <p className="text-xs">{task.description}</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>

        {task.tags?.length > 0 && ( // Check tags array exists and has items
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <TaskTag key={tag.name} tag={tag} />
            ))}
          </div>
        )}

        <div
          className={cn(
            'flex items-center text-xs font-medium mt-2',
            task.dueDate && isOverdue ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          <Calendar size={14} className="mr-1.5" />
          <span>
            {task.dueDate ? (isOverdue ? 'Overdue: ' : 'Due: ') : ''}
            {formattedDueDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;