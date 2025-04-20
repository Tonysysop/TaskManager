import React from "react";
import { Button } from "./ui/button";

interface TagProps {
  tagName: string;
  selectTag: (tag: string) => void;
  selected: boolean;
}

const tagClassMap: Record<string, string> = {
  Personal: "bg-orange-400 text-white",
  School: "bg-cyan-500 text-white",
  Household: "bg-yellow-400 text-black",
  Others: "bg-sky-400 text-white",
  default: "bg-gray-200 text-black"
};

const Tag: React.FC<TagProps> = ({ tagName, selectTag, selected }) => {
  const selectedClass = selected ? tagClassMap[tagName] || tagClassMap.default : tagClassMap.default;

  return (
    <Button
      size="sm"
      type="button"
      onClick={() => selectTag(tagName)}
      className={`
        border rounded-md px-2 py-0.5 mr-1 mb-2 cursor-pointer
        transition-all duration-300 ease-in-out
        ${selectedClass}
        ${selected ? "shadow-[0_0_8px_rgba(168,85,247,0.6)] hover:scale-[1.03]" : "hover:bg-gray-300"}
        focus:ring-0 focus:ring-offset-0 focus:outline-none
      `}
      
    >
      {tagName}
    </Button>
  );
};

export default Tag;
