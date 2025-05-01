import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithPresets } from "@/components/Date-picker"
import { AnimatedInput } from "../ui/new-input";
import { Circle } from "lucide-react"
import { useTags } from "@/Context/TagContext" 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {  z } from "zod";
import { useState } from "react";
import { toast } from "sonner"



// Zod Schema for task input
const taskInputSchema = z.object({
  taskTitle: z.string().min(2, "Task Title must be at least 2 characters long"),
  description: z.string().optional(),
  taskType: z.enum(["Todo", "Doing", "Done"]),
  dueDate: z.date(),
  priority: z.enum(["No Rush", "Normal", "Urgent", "Critical"]),
  tag: z.string().optional(),
});
type TaskInputForm = z.infer<typeof taskInputSchema>;

// Define the type for a single task
interface TaskComponent {
  task: string;
  description: string;
  status: string;
  tags: string[];
  dueDate: string;
}


// Define props type
interface TaskFormProps {
  setTasks: React.Dispatch<React.SetStateAction<TaskComponent[]>>;
}

const NewTaskForm: React.FC<TaskFormProps> = ({ setTasks }) => {
  const [open, setOpen] = useState(false);
  const [taskData, setTaskData] = useState<TaskComponent>({
    task: "",
    description: "",
    status: "",
    tags: [],
    dueDate: new Date().toISOString(),
  });



  const placeholders = [
    "Add a new task...",
    "What do you want to do?",
    "Enter your goal here...",
  ];
  const { tags } = useTags()
  const [loading, setLoading] = useState(false);
  

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = useForm<TaskInputForm>({
    mode: "onChange",
    resolver: zodResolver(taskInputSchema),
  });

  const watchedTitle = watch("taskTitle", "");
  const watchedDueDate = watch("dueDate")
  const watchedTaskType = watch("taskType");

  const onSubmit = (data: TaskInputForm) => {
  setLoading(true);
  try {
    setTasks((prev) => [
      ...prev,
      {
        task: data.taskTitle,
        description: data.description || "",
        status: data.taskType,
        tags: data.tag ? [data.tag] : [],
        dueDate: data.dueDate ? data.dueDate.toISOString() : new Date().toISOString(),
      }
    ]);

    toast.success("Todo added", {
      description: "Your new todo has been added to the list",
    });

    reset();
    setOpen(false);
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">+ Add Task</Button>
      </DialogTrigger>

      <DialogContent 
        forceMount
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[750px] min-h-[650px] max-h-[90vh] flex flex-col overflow-y-auto"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto pr-2">
          <div className="flex-1 overflow-y-auto">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-semibold">Add New Task</DialogTitle>
              <DialogDescription>Organize your tasks effectively by filling in the details below.</DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-6">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title*</Label>
                <AnimatedInput
                  placeholders={placeholders}
                  interval={4000}
                  {...register("taskTitle")}
                  value={watchedTitle}
                  onChange={(e) => setValue("taskTitle", e.target.value)}
                />
                {errors.taskTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.taskTitle.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  placeholder="Describe your task..."
                  className="resize-none"
                  {...register("description")}
                />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Task Type */}
                <div className="flex flex-col gap-2">
                  <Label>Task Type</Label>
                  <Select 
                      onValueChange={(value) => setValue("taskType", value as TaskInputForm["taskType"])}  
                      value={watchedTaskType} 
                    >

                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todo">Todo</SelectItem>
                      <SelectItem value="Doing">Doing</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.taskType && (
                    <p className="text-red-500 text-sm">{errors.taskType.message}</p>
                  )}
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-2">
                  <Label>Due Date</Label>
                  <DatePickerWithPresets
                      value={watchedDueDate}
                      onChange={(date) => {
                        if (date) {
                          setValue("dueDate", date);
                        }
                        }}
                  />
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-2">
                  <Label>Priority</Label>
                  <Select onValueChange={(value) => setValue("priority", value as TaskInputForm["priority"])}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No Rush">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3 text-gray-400" />
                          No Rush
                        </div>
                      </SelectItem>
                      <SelectItem value="Normal">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3 text-blue-500" />
                          Normal
                        </div>
                      </SelectItem>
                      <SelectItem value="Urgent">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3 text-yellow-500" />
                          Urgent
                        </div>
                      </SelectItem>
                      <SelectItem value="Critical">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3 text-red-600" />
                          Critical
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm">{errors.priority.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-2">
                  <Label>Tags</Label>
                  <Select onValueChange={(value) => setValue("tag", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.name} value={tag.name}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${tag.color}`} />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t mt-auto pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? "Adding..." : "+ Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewTaskForm