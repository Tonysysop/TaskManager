
import { Button } from './ui/button'



const Tag = (props: any) => {
    
  return (
    
    <Button className='text-sm font-medium bg-gray-100 border border-gray-300 rounded-md px-2 py-0.5 mr-2 cursor-pointer'>{props.tagName}</Button>
    
  )
}

export default Tag