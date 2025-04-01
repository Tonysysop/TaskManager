import React, {useState} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import Tag from "@/components/Tag"

// Define the type for a single task
interface TaskComponents{
    task:string;
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
        status: "To do",
        tags: [] as string[]
    })

    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTaskData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
       

    const handleStatusChange = (value: string) => {
        setTaskData((prev) => ({
            ...prev,
            status: value
        }))

    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTasks(prev => [...prev, taskData]); // Append new task correctly
        setTaskData({ task: "", status: "Todo", tags: [] }); // Clear form
        console.log(taskData)
    };
    

    const selectTag = (tag: string) => {
        if (taskData.tags.some(item => item === tag)) {
            const filterTags = taskData.tags.filter(item => item !== tag )
            setTaskData(prev =>{
                return{...prev, tags: filterTags}
            })
        }else {
            setTaskData((prev) => {
                return {...prev, tags: [...prev.tags, tag] }
            })
        }
    }

    const checkTag = (tag: string): boolean => taskData.tags.includes(tag);

    // const checkTag = (tag:string):boolean => {
    //     return taskData.tags.some(item => item === tag)
    // }


    




  return (
    <header className='flex items-center justify-center border-b border-gray-300'> {/*App_header*/}
        <form onSubmit={handleSubmit} className='w-[40%]' >
        <Input className='text-lg font-medium bg-gray-100 text-black border border-gray-300 rounded-md px-3 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Enter your task'
            onChange={handleChange}
            value={taskData.task}
            name='task'
        />
  {/*task_input*/}

            <div className='flex items-center justify-between'> {/*task_form_bottom_line*/}
                <div>
                    <Tag tagName = "Personal" selectTag={selectTag} selected={checkTag("Personal")} />
                    <Tag tagName = "Others" selectTag={selectTag} selected={checkTag("Others")} />
                    <Tag tagName = "Household" selectTag={selectTag} selected={checkTag("Household")} />
                    <Tag tagName = "School" selectTag={selectTag} selected={checkTag("School")} />
                </div>


                <div className='flex items-center>' >
                    <Select onValueChange={handleStatusChange} value={taskData.status}  > {/*task_status*/}
                        <SelectTrigger className="text-sm font-medium border border-gray-500 rounded-md w-[120px] h-[40px] px-1">
                            <SelectValue placeholder="Todo" /> 
                        </SelectTrigger>
                        <SelectContent >
                            <SelectItem value="Todo">Todo</SelectItem>
                            <SelectItem value="Doing">Doing</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button className="text-base font-medium bg-indigo-600 text-white rounded-md h-10 px-3.5 ml-2.5 border-none cursor-pointer" type='submit'> + Add Task </Button> {/*task_submit*/}
                </div>


            </div>
        </form>
    </header>
    
  )
}

export default TaskForm


