import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithPresets } from "@/components/Date-picker";
import { AnimatedInput } from "../ui/new-input";
import { Circle, Plus, X } from "lucide-react";
import { useTags } from "@/Context/TagContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TaskAttributes } from "@/types/TaskAttributes"; // Ensure TaskAttributes type is complete
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/Context/AuthContext";
import { TagSelector } from "./TagSelector";

// Zod Schema for task input
const taskInputSchema = z.object({
  taskTitle: z.string().min(2, "Task Title must be at least 2 characters long"),
  description: z.string().optional(),
  taskType: z.enum(["Planned", "In-Progress", "Completed"]),
  dueDate: z.date(),
  priority: z.enum(["No Rush", "Normal", "Urgent", "Critical"]),
  tag: z.array(z.string()).min(1, "Please select at least one tag"),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(), // Mark checklist as optional here
});
type TaskInputForm = z.infer<typeof taskInputSchema>;

// Define props type
interface TaskFormProps {
  mode: "create" | "edit";
  initialTask?: TaskAttributes;
  onCreate: (task: TaskAttributes) => void;
  onOpenChange: (open: boolean) => void;
  opened: boolean;
}

// Define initial state for the checklist and show on card options
const initialTaskState = {
  checklist: [] as { id: string; text: string; completed: boolean }[],
  showDescriptionOnCard: true,
  showChecklistOnCard: false,
};

const NewTaskForm: React.FC<TaskFormProps> = ({
  onCreate,
  initialTask,
  mode,
  opened,
  onOpenChange,
}) => {
  const [taskState, setTaskState] = useState(initialTaskState);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const { user } = useAuth();

  const placeholders = [
    "Add a new task...",
    "What do you want to do?",
    "Enter your goal here...",
  ];
  const { tags } = useTags();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
    control,
  } = useForm<TaskInputForm>({
    mode: "onChange",
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      tag: [],
      taskType: "Planned",
      checklist: [],
      ...(initialTask && {
        taskTitle: initialTask.task,
        description: initialTask.description,
        taskType: initialTask.status,
        dueDate:
          initialTask.dueDate instanceof Date
            ? initialTask.dueDate
            : new Date(initialTask.dueDate),
        priority: initialTask.priority as any,
        tag: initialTask.tags.map((t) => t.name),
        checklist: initialTask.checklist || [],
      }),
      // Set default dueDate if needed, e.g., new Date()
    },
  });

  // inside NewTaskForm:
  useEffect(() => {
    if (opened && mode === "create") {
      // clear the react-hook-form fields
      reset({
        taskTitle: "",
        description: "",
        taskType: "Planned",
        dueDate: new Date(),
        priority: "Normal",
        tag: [],
        checklist: [],
      });
      // clear your local showDescriptionOnCard / showChecklistOnCard
      setTaskState(initialTaskState);
    }
  }, [opened, mode, reset]);

  // when `initialTask` arrives (e.g. on edit) re-populate
  useEffect(() => {
    if (initialTask) {
      reset({
        taskTitle: initialTask.task,
        description: initialTask.description,
        taskType: initialTask.status,
        dueDate:
          initialTask.dueDate instanceof Date
            ? initialTask.dueDate
            : new Date(initialTask.dueDate),
        priority: initialTask.priority as any,
        tag: initialTask.tags.map((t) => t.name),
        checklist: initialTask.checklist || [],
      });
      // also sync your local showDescriptionOnCard / showChecklistOnCard
      setTaskState({
        checklist: initialTask.checklist || [],
        showDescriptionOnCard: initialTask.showDescriptionOnCard,
        showChecklistOnCard: initialTask.showChecklistOnCard,
      });
    }
  }, [initialTask, reset]);

  const {
    fields: checklistFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "checklist",
  });

  const watchedTitle = watch("taskTitle", "");
  const watchedDueDate = watch("dueDate");
  const watchedTaskType = watch("taskType");
  const watchedTags = watch("tag");

  const mapTaskTypeToStatus = (
    taskType: TaskInputForm["taskType"]
  ): "Planned" | "In-Progress" | "Completed" => {
    switch (taskType) {
      case "Planned":
        return "Planned";
      case "In-Progress":
        return "In-Progress";
      case "Completed":
        return "Completed";
      default:
        return "Planned";
    }
  };

  const handleTagSelect = (tagName: string) => {
    const currentTags = watchedTags || [];
    if (currentTags.includes(tagName)) {
      // Tag is already selected, remove it
      setValue(
        "tag",
        currentTags.filter((tag) => tag !== tagName)
      );
    } else {
      // Tag is not selected, add it
      setValue("tag", [...currentTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    const currentTags = watchedTags || [];
    setValue(
      "tag",
      currentTags.filter((tag) => tag !== tagName)
    );
  };

  const onSubmit = (data: TaskInputForm) => {
    setLoading(true);
    try {
      const selectedTags = tags.filter((tag) => data.tag.includes(tag.name));

      if (selectedTags.length === 0) {
        toast.error("Please select valid tags.");
        setLoading(false); // Stop loading if there's a tag error
        return; // Early return if no valid tags
      }

      console.log("userSub:", user?.sub);

      // Ensure there's a userSub for the task; you might want to handle the case where it's missing
      if (!user?.sub) {
        toast.error("User not authenticated.");
        return;
      }
      // Construct the newTask object including checklist and show on card states
      const newTask: TaskAttributes = {
        userId: user?.sub!,
        id: mode === "edit" ? initialTask!.id : uuidv4(),
        task: data.taskTitle,
        status: mapTaskTypeToStatus(data.taskType),
        tags: selectedTags,
        dueDate: data.dueDate.toISOString(),
        priority: data.priority,
        checklist: data.checklist || [],
        // **Always include description** (defaulting to an empty string if unset)
        description: data.description ?? "",
        // But drive the card‐rendering off this flag:
        showDescriptionOnCard: taskState.showDescriptionOnCard,
        showChecklistOnCard: taskState.showChecklistOnCard,
      };

      console.log("Task:", newTask);

      onCreate(newTask);

      toast.success("Task added", {
        description: "Your new task has been added to the list",
      });

      // Reset form and local state
      reset();
      setTaskState(initialTaskState);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error); // Log the error for debugging
      toast.error("An error occurred while adding the task.");
    } finally {
      setLoading(false);
    }
  };

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      append({
        id: uuidv4(), // generate a unique ID
        text: newChecklistItem.trim(),
        completed: false,
      });
      setNewChecklistItem("");
      setIsAddingChecklist(false);
    }
  };

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      {/* only show this trigger in create mode */}
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button>+ Add Task</Button>
        </DialogTrigger>
      )}

      <DialogContent
        forceMount
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="dark:bg-zinc-900 bg-zinc-100 sm:max-w-[750px] min-h-[650px] max-h-[90vh] flex flex-col overflow-y-auto"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-y-auto pr-2"
        >
          <div className="flex-1 overflow-y-auto">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-semibold">
                {mode === "create" ? "Add New Task" : "Edit Task"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Fill in the details to add a new task"
                  : "Modify the fields and save your changes"}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex flex-col gap-6 shadow-lg ">
              <div className="flex justify-between items-center"></div>
              <div className="mb-4">
                <Label
                  htmlFor="taskTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Task Title
                </Label>
                <div className="relative mt-2">
                  <AnimatedInput
                    id="taskTitle"
                    className="w-full p-3  rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100 transition-all ease-in-out duration-200 shadow-sm focus:outline-none"
                    placeholders={placeholders}
                    interval={4000}
                    {...register("taskTitle")}
                    value={watchedTitle}
                    onChange={(e) => setValue("taskTitle", e.target.value)}
                  />
                  {errors.taskTitle && (
                    <p className="text-red-500 text-sm mt-2 absolute bottom-0 left-0">
                      {errors.taskTitle.message}
                    </p>
                  )}
                </div>
              </div>

              {/* TagSelor */}
              <TagSelector
                tagPopoverOpen={tagPopoverOpen}
                setTagPopoverOpen={setTagPopoverOpen}
                tags={tags}
                watchedTags={watchedTags}
                handleTagSelect={handleTagSelect}
                handleRemoveTag={handleRemoveTag}
                errorMessage={errors.tag?.message}
              />

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Task Type */}
                <div className="flex flex-col gap-2">
                  <Label>Task Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("taskType", value as TaskInputForm["taskType"])
                    }
                    value={watchedTaskType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="In-Progress">In-Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.taskType && (
                    <p className="text-red-500 text-sm">
                      {errors.taskType.message}
                    </p>
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
                  <Select
                    onValueChange={(value) =>
                      setValue("priority", value as TaskInputForm["priority"])
                    }
                  >
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
                          <span className="">Normal</span>
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
                    <p className="text-red-500 text-sm">
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Notes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showNotes"
                      checked={taskState.showDescriptionOnCard}
                      onCheckedChange={(checked) =>
                        setTaskState({
                          ...taskState,
                          showDescriptionOnCard: checked === true,
                          showChecklistOnCard:
                            checked === true
                              ? false
                              : taskState.showChecklistOnCard,
                        })
                      }
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-gray-400"
                    />
                    <Label htmlFor="showNotes" className="text-sm">
                      Show on card
                    </Label>
                  </div>
                </div>

                <Textarea
                  id="description"
                  placeholder="Type a description or add notes here..."
                  className="w-full min-h-24 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100 transition-all ease-in-out duration-200 shadow-sm focus:outline-none"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium">
                    Checklist{" "}
                    {(watch("checklist")?.length ?? 0) > 0 &&
                      `(${
                        watch("checklist")?.filter((item) => item.completed)
                          .length ?? 0
                      } / ${watch("checklist")?.length ?? 0})`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showChecklist"
                      checked={taskState.showChecklistOnCard}
                      onCheckedChange={(checked) => {
                        setTaskState((prev) => ({
                          ...prev,
                          showChecklistOnCard: checked === true,
                          showDescriptionOnCard:
                            checked === true
                              ? false
                              : prev.showDescriptionOnCard,
                        }));
                      }}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-gray-400 dark:data-[state=checked]:bg-purple-600 dark:data-[state=checked]:border-purple-600 dark:data-[state=unchecked]:bg-transparent dark:data-[state=unchecked]:border-gray-500"
                    />
                    <Label
                      htmlFor="showChecklist"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Show on card
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {checklistFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative flex items-center gap-2 group"
                    >
                      <Controller
                        control={control}
                        name={`checklist.${index}.completed`}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-gray-400 dark:data-[state=checked]:bg-purple-600 dark:data-[state=checked]:border-purple-600 dark:data-[state=unchecked]:bg-transparent dark:data-[state=unchecked]:border-gray-500"
                          />
                        )}
                      />
                      <input
                        type="text"
                        {...register(`checklist.${index}.text`)}
                        className="flex-1 text-sm bg-transparent outline-none dark:text-white"
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => remove(index)}
                        size="icon"
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove checklist item`}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}

                  {isAddingChecklist ? (
                    <div className="flex items-center gap-2">
                      <Input
                        className="border w-60 text-sm text-gray-900 dark:text-gray-100 dark:border-gray-500"
                        placeholder="Add an item"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddChecklistItem();
                          }
                          if (e.key === "Escape") {
                            setIsAddingChecklist(false);
                            setNewChecklistItem("");
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddChecklistItem}
                        disabled={!newChecklistItem.trim()}
                        className="text-green-500 hover:text-green-600"
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="hover:text-red-500 opacity-60 transition-opacity"
                        onClick={() => {
                          setIsAddingChecklist(false);
                          setNewChecklistItem("");
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingChecklist(true)}
                      className="flex items-center gap-2 hover:text-purple-500 dark:text-white"
                    >
                      <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center dark:border-white/20">
                        <Plus size={12} />
                      </div>
                      Add an item
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>{" "}
          <DialogFooter className="border-t mt-auto pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
            >
              {mode === "create" ? "+ Add Task" : "Update Task"}
            </Button>
          </DialogFooter>
        </form>{" "}
        {/* Closing form tag */}
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskForm;
