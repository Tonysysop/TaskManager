import React from 'react'
import { Button } from './ui/button'


interface TagProps {
  tagName: string;
  selectTag: (tag: string) => void;
  selected:boolean
}


const Tag: React.FC<TagProps> = ({ tagName, selectTag, selected}) => {

  const tagStyle: Record<TagProps["tagName"], { backgroundColor: string }> = {
    Personal: {backgroundColor: "#fda821"},
    School: {backgroundColor: "#15d4c8"},
    Household: {backgroundColor: "#ffd12c"},
    Others: {backgroundColor: "#4cdafc"},
    default: {backgroundColor: "#f9f9f9"}
  }

    
  return (
    
    <Button 
      type='button' 
      className='text-xs font-sans bg-gray-100 border border-gray-300 rounded-md px-2 py-0.5 mr-1 cursor-pointer mb-2' 
      style={selected ? tagStyle[tagName] : tagStyle.default}
      onClick={() => selectTag(tagName)}>
      {tagName}
    </Button>
    
  )
}

export default Tag