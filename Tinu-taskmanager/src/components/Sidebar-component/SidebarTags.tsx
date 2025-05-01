import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Tag, Plus, X, } from "lucide-react";
import { useState,useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTags } from "@/Context/TagContext"; // 👈 import useTags
import TaskTag from '@/components/TaskManager/NewTag';

export function SidebarTags() {
  const { tags, addTag, removeTag, editTag } = useTags(); // 👈 use context
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState("");


  // useEffect hook to log tags whenever they change
  useEffect(() => {
    console.log('Tags updated:', tags);
  }, [tags]); // Dependency array ensures this runs when `tags` change



  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.find((t) => t.name === trimmed)) {
      addTag(trimmed); // 👈 use context function
      setNewTag("");
      setAdding(false);
    }
  };
  

  const handleSaveEditedTag = () => {
    const trimmed = editedTagName.trim();
    if (editingTag && trimmed) {
      editTag(editingTag, trimmed); // 👈 use context function
      setEditingTag(null);
      setEditedTagName("");
    }
    
  };
  

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tags</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setIsOpen(!isOpen)} tooltip="Tags">
            <Tag className="w-4 h-4" />
            <span>Tags</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {isOpen && (
          <>
            {tags.map((tag) => (
  <SidebarMenuSub key={tag.name}>
    <SidebarMenuSubButton>
      <div className="flex items-center gap-2 w-full">
        {editingTag === tag.name ? (
          <Input
            value={editedTagName}
            onChange={(e) => setEditedTagName(e.target.value)}
            onBlur={handleSaveEditedTag}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEditedTag();
            }}
            className="h-6 w-full"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 truncate cursor-pointer"
            onClick={() => {
              setEditingTag(tag.name);
              setEditedTagName(tag.name);
            }}
          >
            <TaskTag tag={tag} />
          </span>
        )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag.name); // 👈 use context function
                      }}
                      className="ml-2 text-destructive hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </SidebarMenuSubButton>
              </SidebarMenuSub>
            ))}

            {adding ? (
              <div className="px-4 py-2 space-y-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag"
                  className="h-8"
                  autoFocus
                />
                <Button onClick={handleAddTag} size="sm" className="w-full">
                  Add Tag
                </Button>
              </div>
            ) : (
              <SidebarMenuSub>
                <SidebarMenuSubButton onClick={() => setAdding(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add New Tag</span>
                </SidebarMenuSubButton>
              </SidebarMenuSub>
            )}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}





















// import {
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
// } from "@/components/ui/sidebar"
// import { Tag, Plus, X } from "lucide-react"
// import { useState } from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"


// const tagColors = [
//   "bg-red-500",
//   "bg-blue-500",
//   "bg-green-500",
//   "bg-yellow-500",
//   "bg-purple-500",
//   "bg-pink-500",
//   "bg-teal-500",
// ]

// export function SidebarTags() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [tags, setTags] = useState([
//     { name: "General", color: tagColors[0] },
//     { name: "Team", color: tagColors[1] },
//     { name: "Billing", color: tagColors[2] },
//     { name: "Limits", color: tagColors[3] },
//   ])
//   const [newTag, setNewTag] = useState("")
//   const [adding, setAdding] = useState(false)
//   const [editingTag, setEditingTag] = useState<string | null>(null)
//   const [editedTagName, setEditedTagName] = useState("")

//   const addTag = () => {
//     const trimmed = newTag.trim()
//     if (trimmed && !tags.find((t) => t.name === trimmed)) {
//       const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)]
//       setTags([...tags, { name: trimmed, color: randomColor }])
//       setNewTag("")
//       setAdding(false)
//     }
//   }

//   const removeTag = (tagName: string) => {
//     setTags(tags.filter((t) => t.name !== tagName))
//   }

//   const saveEditedTag = () => {
//     const trimmed = editedTagName.trim()
//     if (editingTag && trimmed) {
//       setTags((prev) =>
//         prev.map((tag) =>
//           tag.name === editingTag ? { ...tag, name: trimmed } : tag
//         )
//       )
//       setEditingTag(null)
//       setEditedTagName("")
//     }
//   }

//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>Tags</SidebarGroupLabel>
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <SidebarMenuButton onClick={() => setIsOpen(!isOpen)} tooltip="Tags">
//             <Tag className="w-4 h-4" />
//             <span>Tags</span>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         {isOpen && (
//           <>
//             {tags.map((tag) => (
//               <SidebarMenuSub key={tag.name}>
//                 <SidebarMenuSubButton>
//                   <div className="flex items-center gap-2 w-full">
//                     <div className={`w-2.5 h-2.5 rounded-full ${tag.color}`}></div>

//                     {editingTag === tag.name ? (
//                       <Input
//                         value={editedTagName}
//                         onChange={(e) => setEditedTagName(e.target.value)}
//                         onBlur={saveEditedTag}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter") saveEditedTag()
//                         }}
//                         className="h-6 w-full"
//                         autoFocus
//                       />
//                     ) : (
//                       <span
//                         className="flex-1 truncate cursor-pointer"
//                         onClick={() => {
//                           setEditingTag(tag.name)
//                           setEditedTagName(tag.name)
//                         }}
//                       >
//                         {tag.name}
//                       </span>
//                     )}

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         removeTag(tag.name)
//                       }}
//                       className="ml-2 text-destructive hover:text-red-600"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 </SidebarMenuSubButton>
//               </SidebarMenuSub>
//             ))}

//             {adding ? (
//               <div className="px-4 py-2 space-y-2">
//                 <Input
//                   value={newTag}
//                   onChange={(e) => setNewTag(e.target.value)}
//                   placeholder="New tag"
//                   className="h-8"
//                   autoFocus
//                 />
//                 <Button onClick={addTag} size="sm" className="w-full">
//                   Add Tag
//                 </Button>
//               </div>
//             ) : (
//               <SidebarMenuSub>
//                 <SidebarMenuSubButton onClick={() => setAdding(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   <span>Add New Tag</span>
//                 </SidebarMenuSubButton>
//               </SidebarMenuSub>
//             )}
//           </>
//         )}
//       </SidebarMenu>
//     </SidebarGroup>
//   )
// }
