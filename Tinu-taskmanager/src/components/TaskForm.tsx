import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tag from "@/components/Tag";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Zod Schema for task input
const taskInputSchema = z.object({
  taskTitle: z
    .string()
    .min(2, "Task Title must be at least 2 characters long")
    .max(100, "Task is too long"),
});

type TaskInputForm = z.infer<typeof taskInputSchema>;

// Define the type for a single task
interface TaskComponents {
  task: string;
  status: string;
  tags: string[];
}

// Define props type
interface TaskFormProps {
  setTasks: React.Dispatch<React.SetStateAction<TaskComponents[]>>;
}

const TaskForm: React.FC<TaskFormProps> = ({ setTasks }) => {
  const [taskData, setTaskData] = useState<TaskComponents>({
    task: "",
    status: "",
    tags: [] as string[],
  });

  const [error, setError] = useState<string | null>(null); // Error state

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskInputForm>({
    resolver: zodResolver(taskInputSchema),
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaskData((prev) => ({
      ...prev,
      status: e.target.value,
    }));
    setError(null); // Clear error when status is selected
  };

  const onSubmit = (data: TaskInputForm) => {
    if (!taskData.status) {
      setError("Please select a task category before adding a task.");
      return;
    }

    setTasks((prev) => [...prev, { ...taskData, task: data.taskTitle }]);
    setTaskData({ task: "", status: "", tags: [] });
    reset(); // Reset form state
  };

  const selectTag = (tag: string) => {
    if (taskData.tags.includes(tag)) {
      setTaskData((prev) => ({
        ...prev,
        tags: prev.tags.filter((item) => item !== tag),
      }));
    } else {
      setTaskData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const checkTag = (tag: string): boolean => taskData.tags.includes(tag);

  return (
    <header className="flex items-center justify-center border-b border-gray-300">
      <form onSubmit={handleSubmit(onSubmit)} className="w-[40%]">
        {error && (
          <Alert
            variant="destructive"
            className="mb-4 slide-in absolute bottom-4 right-4 z-50 text-red-600 max-w-md"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Input
          className="text-lg font-medium bg-gray-100 text-black border border-gray-300 rounded-md px-3 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your task"
          {...register("taskTitle")} // Register the taskTitle field for react-hook-form
        />
        {errors.taskTitle && (
          <p className="text-red-500 text-sm mb-2">{errors.taskTitle.message}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Tag
              tagName="Personal"
              selectTag={selectTag}
              selected={checkTag("Personal")}
            />
            <Tag
              tagName="Others"
              selectTag={selectTag}
              selected={checkTag("Others")}
            />
            <Tag
              tagName="Household"
              selectTag={selectTag}
              selected={checkTag("Household")}
            />
            <Tag
              tagName="School"
              selectTag={selectTag}
              selected={checkTag("School")}
            />
          </div>
          <div className="flex items-center">
            <select
              className="text-sm font-medium border border-gray-500 rounded-md w-[130px] h-[40px] px-1"
              onChange={handleStatusChange} // Use react-hook-form register
              value={taskData.status}
            >
              <option className="text-gray-500 opacity-20" value="" disabled>
                Category
              </option>
              <option value="Todo">Todo</option>
              <option value="Doing">Doing</option>
              <option value="Done">Done</option>
            </select>
            <Button
              className="text-base font-medium bg-indigo-600 text-white rounded-md h-10 px-3.5 ml-2.5 border-none cursor-pointer"
              type="submit"
            >
              + Add Task
            </Button>
          </div>
        </div>
      </form>
    </header>
  );
};

export default TaskForm;
