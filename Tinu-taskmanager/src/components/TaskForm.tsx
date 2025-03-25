
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
  

const TaskForm = () => {
  return (
    <header className='flex items-center justify-center border-b border-gray-300'> {/*App_header*/}
        <form className='w-[40%]' action="">
        <Input className='text-lg font-medium bg-gray-100 text-black border border-gray-300 rounded-md px-3 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Enter your task' />
  {/*task_input*/}

            <div className='flex items-center justify-between'> {/*task_form_bottom_line*/}
                <div>
                    <Tag tagName = "Personal" />
                    <Tag tagName = "Others" />
                    <Tag tagName = "Household" />
                    <Tag tagName = "School" />
                </div>


                <div className='flex items-center>' >
                    <Select > {/*task_status*/}
                        <SelectTrigger className="text-base font-medium border border-gray-500 rounded-md w-[120px] h-[40px] px-1">
                            <SelectValue placeholder="Todo" />
                        </SelectTrigger>
                        <SelectContent>
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


