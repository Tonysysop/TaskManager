// components/TagSelector.tsx

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTags } from "@/Context/TagContext";
import { TagIcon, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"; // Assuming Input component is imported
import { Button } from "../ui/button";

interface Tag {
  tagId: string; // Assuming you use tagId for editing/removing tags
  name: string;
  color?: string;
}

interface TagSelectorProps {
  tagPopoverOpen: boolean;
  setTagPopoverOpen: (open: boolean) => void;
  tags: Tag[];
  watchedTags: string[];
  handleTagSelect: (tagName: string) => void;
  handleRemoveTag: (tagName: string) => void;
  errorMessage?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tagPopoverOpen,
  setTagPopoverOpen,
  tags,
  watchedTags,
  handleTagSelect,
  handleRemoveTag,
  errorMessage,
}) => {
  const { addTag, removeTag, editTag } = useTags();
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState("");
  const safeTags = Array.isArray(tags) ? tags : [];

  useEffect(() => {
    console.log("Tags updated:", safeTags);
  }, [safeTags]);

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !safeTags.find((t) => t.name === trimmed)) {
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
    <div className="mb-4">
      <Popover modal open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="w-full min-h-[2.5rem] px-3 py-2 border rounded-lg flex flex-wrap border-gray-300 dark:border-gray-600 bg-transparent dark:bg-input/30 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100 transition-all ease-in-out duration-200 shadow-sm focus:outline-none">
            <TagIcon className="h-6 w-6 mr-2 text-gray-400 dark:text-gray-500 shrink-0" />
            {watchedTags.length > 0 ? (
              watchedTags.map((tagName) => {
                const tagObj = tags.find((t) => t.name === tagName);
                const tagClassString =
                  tagObj?.color || "bg-gray-300 text-gray-800";

                return (
                  <span
                    key={tagName}
                    className={`flex items-center rounded-full px-2 mr-2 py-1 text-sm ${tagClassString}`}
                  >
                    <TagIcon className="h-4 w-4 mr-1" />
                    {tagName}
                    <button
                      type="button"
                      className="ml-1 text-gray-600 dark:text-gray-300 hover:text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tagName);
                      }}
                    >
                      ×
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400 flex items-center text-sm gap-2">
                Select tags
              </span>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-48 max-h-60 overflow-y-auto rounded-xl border custom-scrollbar transition-colors shadow-xl p-3 "
        >
          <div className="grid gap-3">
            {tags.map((tag) => {
              const isSelected = watchedTags.includes(tag.name);
              const isEditing = editingTagId === tag.tagId;

              return (
                <div
                  key={tag.tagId}
                  className="flex items-center justify-between gap-2 px-1 py-1 group hover:bg-input/50 dark:hover:bg-input/50 "
                >
                  {/* Tag pill or input */}
                  {isEditing ? (
                    <Input
                      value={editedTagName}
                      onChange={(e) => setEditedTagName(e.target.value)}
                      onBlur={handleSaveEditedTag}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEditedTag();
                      }}
                      className="h-6 text-xs px-2 flex-1"
                      autoFocus
                    />
                  ) : (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer flex-1 truncate
                                  ${tag.color || "bg-gray-200 text-gray-800"}
                                  ${
                                    isSelected
                                      ? "ring-2 ring-offset-1 ring-blue-500"
                                      : ""
                                  }
                              `}
                      onClick={() => handleTagSelect(tag.name)}
                    >
                      <TagIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tag.name}</span>
                    </div>
                  )}

                  {/* Edit/Delete buttons */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingTagId(tag.tagId);
                          setEditedTagName(tag.name);
                        }}
                        className="text-gray-500 hover:text-yellow-500 cursor-pointer"
                        aria-label="Edit tag"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeTag(tag.tagId)}
                        className="text-gray-500 hover:text-red-500 cursor-pointer"
                        aria-label="Delete tag"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Add new tag */}
            <div>
              {adding ? (
                <div className="gap-2 items-center mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag();
                    }}
                    onBlur={() => setAdding(false)}
                    autoFocus
                    className="h-6 text-xs px-2"
                    placeholder="New tag"
                  />
                </div>
              ) : (
                <Button
                  variant="link"
                  onClick={() => setAdding(true)}
                  className="text-blue-600  text-xs mt-2"
                >
                  + Add tag
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <p className="text-red-500  text-xs mt-2">{errorMessage}</p>
      )}
    </div>
  );
};
