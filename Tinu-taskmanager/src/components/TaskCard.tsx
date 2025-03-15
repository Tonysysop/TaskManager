
import Tag from '@/components/Tag'
import DeleteIcon from '../assets/delete.png'

const TaskCard = () => {
  return (
    <article className='w-full min-h-[100px] border border-gray-300 rounded-lg p-4 my-4'> {/*Task_card*/}
        <p className='text-lg font-semibold mb-3'>This is sample text</p>{/*taskTest*/}


        <div className='flex items-center justify-between'>{/*task_card_bottom_line*/}
           <div>
                <Tag tagName="School" />
                <Tag tagName="Household" />
                <Tag tagName="Others" />
                <Tag tagName="Personal" />
           </div>{/*task_card_tag*/}

           <div className='w-[35px] h-[35px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-200'>
                <img className='w-[20px] opacity-50 transition-all duration-300 ease-in-out hover:opacity-80' src={DeleteIcon} alt="" /> {/*Delete icon*/}
           </div> {/*task_delete*/}
        </div>
    </article>
  )
}

export default TaskCard