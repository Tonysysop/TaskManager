import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tag from "@/components/Tag";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error when typing
  };

  const handleStatusChange = (value: string) => {
    setTaskData((prev) => ({
      ...prev,
      status: value,
    }));
    setError(null); // Clear error when status is selected
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!taskData.status) {
      setError("Please select a task category before adding a task.");
      return;
    }

    setTasks((prev) => [...prev, taskData]); // Append new task correctly
    setTaskData({ task: "", status: "", tags: [] }); // Clear form
    console.log(taskData);
  };

  const selectTag = (tag: string) => {
    if (taskData.tags.some((item) => item === tag)) {
      const filterTags = taskData.tags.filter((item) => item !== tag);
      setTaskData((prev) => {
        return { ...prev, tags: filterTags };
      });
    } else {
      setTaskData((prev) => {
        return { ...prev, tags: [...prev.tags, tag] };
      });
    }
  };

  const checkTag = (tag: string): boolean => taskData.tags.includes(tag);

  // const checkTag = (tag:string):boolean => {
  //     return taskData.tags.some(item => item === tag)
  // }

  return (
    <header className="flex items-center justify-center border-b border-gray-300">
      {" "}
      {/*App_header*/}
      <form onSubmit={handleSubmit} className="w-[40%]">
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
          onChange={handleChange}
          value={taskData.task}
          name="task"
        />
        {/*task_input*/}

        <div className="flex items-center justify-between">
          {" "}
          {/*task_form_bottom_line*/}
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
          <div className="flex items-center>">
            <select
              className="text-sm font-medium border border-gray-500 rounded-md w-[130px] h-[40px] px-1"
              onChange={(e) => handleStatusChange(e.target.value)}
              value={taskData.status}
            >
              <option className="text-gray-500 opacity-20" value="" disabled>
                Category
              </option>
              <option value="Todo">Todo</option>
              <option value="Doing">Doing</option>
              <option value="Done">Done</option> {/*task_status*/}
            </select>
            <Button
              className="text-base font-medium bg-indigo-600 text-white rounded-md h-10 px-3.5 ml-2.5 border-none cursor-pointer"
              type="submit"
            >
              {" "}
              + Add Task{" "}
            </Button>{" "}
            {/*task_submit*/}
          </div>
        </div>
      </form>
    </header>
  );
};

export default TaskForm;
