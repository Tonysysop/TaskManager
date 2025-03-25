
import TaskCard from '@/components/TaskCard';

const TaskColumn = ({icon, columnName}:{ icon: string; columnName: string }) => {
  return (
    <section className='w-1/3  m-5'>
        <h2 className='flex items-center font-bold'>
            <img className='w-[30px] mr-[5px]' src={icon} alt="" /> {columnName}
        </h2> {/*Task_column_heading and task_column icon*/} 


        <TaskCard />
    </section>
  )
}

export default TaskColumn