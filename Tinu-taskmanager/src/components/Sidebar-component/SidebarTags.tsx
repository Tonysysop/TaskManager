import { useState, useEffect } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Tag as TagIcon, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTags } from "@/Context/TagContext";
import TaskTag from "@/components/TaskManager/NewTag";

export function SidebarTags() {
  const { tags, addTag, removeTag, editTag } = useTags();
  const safeTags = Array.isArray(tags) ? tags : [];

  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState("");

  useEffect(() => {
    console.log("Tags updated:", safeTags);
  }, [safeTags]);

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !safeTags.find(t => t.name === trimmed)) {
      addTag(trimmed);
      setNewTag("");
      setAdding(false);
    }
  };

  const handleSaveEditedTag = () => {
    const trimmed = editedTagName.trim();
    if (editingTagId && trimmed) {
      editTag(editingTagId, trimmed);
      setEditingTagId(null);
      setEditedTagName("");
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tags</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setIsOpen(!isOpen)} tooltip="Tags">
            <TagIcon className="w-4 h-4" />
            <span>Tags</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {isOpen && (
          <>
            {safeTags.map(tag => (
              <SidebarMenuSub key={tag.tagId}>
                <SidebarMenuSubButton>
                  <div className="flex items-center gap-2 w-full">
                    {editingTagId === tag.tagId ? (
                      <Input
                        value={editedTagName}
                        onChange={e => setEditedTagName(e.target.value)}
                        onBlur={handleSaveEditedTag}
                        onKeyDown={e => { if (e.key === "Enter") handleSaveEditedTag(); }}
                        className="h-6 w-full"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="flex-1 truncate cursor-pointer"
                        onClick={() => {
                          setEditingTagId(tag.tagId);
                          setEditedTagName(tag.name);
                        }}
                      >
                        <TaskTag tag={tag} />
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeTag(tag.tagId);
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
                  onChange={e => setNewTag(e.target.value)}
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

