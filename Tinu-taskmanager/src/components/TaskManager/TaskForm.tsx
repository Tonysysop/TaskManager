import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Tag from "@/components/TaskManager/Tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedInput } from "../ui/new-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// Zod Schema for task input
const taskInputSchema = z.object({
  taskTitle: z
    .string()
    .min(2, "Task Title must be at least 2 characters long")
    .max(100, "Task is too long"),
});

type TaskInputForm = z.infer<typeof taskInputSchema>;

// Define the type for a single task
interface TaskComponent {
  task: string;
  status: string;
  tags: string[];
  date: string;
}

// Define props type
interface TaskFormProps {
  setTasks: React.Dispatch<React.SetStateAction<TaskComponent[]>>;
}

const TaskForm: React.FC<TaskFormProps> = ({ setTasks }) => {
  const [taskData, setTaskData] = useState<TaskComponent>({
    task: "",
    status: "",
    tags: [],
    date: new Date().toISOString(),
  });
  const placeholders = [
    "Add a new task...",
    "What do you want to do?",
    "Enter your goal here...",
  ];

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TaskInputForm>({
    mode: "onChange",
    resolver: zodResolver(taskInputSchema),
  });

  const watchedTitle = watch("taskTitle", "");

  // const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setTaskData((prev) => ({
  //     ...prev,
  //     status: e.target.value,
  //   }));
  // };

  const onSubmit = (data: TaskInputForm) => {
    setLoading(true);

    setTasks((prev) => [...prev, { ...taskData, task: data.taskTitle }]);

    setTaskData({
      task: "",
      status: "",
      tags: [],
      date: new Date().toISOString(),
    });
    toast("Todo added",{
      description: "Your new todo has been added to the list"
    })

    reset();
    setLoading(false);
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
    <div>
        <header className="flex items-center justify-center ">
          <form onSubmit={handleSubmit(onSubmit)} className="w-[50%] relative">
            <AnimatedInput
              className="px-3 py-2 mb-4 w-full mt- rounded-full"
              placeholders={placeholders}
              interval={4500}
              {...register("taskTitle")}
              value={watchedTitle}
            />

            {errors.taskTitle && (
              <p className="text-red-500 text-xs mb-2">
                {errors.taskTitle.message}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
              <div className="flex flex-wrap gap-1">
                {["Personal", "Others", "Household", "School"].map((tag) => (
                  <Tag
                    key={tag}
                    tagName={tag}
                    selectTag={selectTag}
                    selected={checkTag(tag)}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-2.5 mr-6 mb-2">
                <Select
                  onValueChange={(value) =>
                    setTaskData((prev) => ({ ...prev, status: value }))
                  }
                  value={taskData.status}
                >
                  <SelectTrigger className="w-[110px] px-2 py-0.5">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="Doing">Doing</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          className="text-sm  bg-indigo-600 text-white rounded-md h-8 px-3.5  border-none cursor-pointer disabled:opacity-50"
                          type="submit"
                          disabled={!taskData.status || loading}
                        >
                          {loading ? "Adding..." : "+ Add Task"}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!taskData.status && (
                      <TooltipContent>
                        <p>Select a category first</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                
              </div>
            </div>
          </form>
        </header>
      <Separator className="w-full h-[2px] mx-auto my-2" />
    </div>

  );
};

export default TaskForm;
