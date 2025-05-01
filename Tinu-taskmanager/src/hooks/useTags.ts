import { useState } from "react";

type Tag = {
  name: string;
  color: string;
};

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([
    { name: "General", color: "bg-gray-400" },
    { name: "Billing", color: "bg-blue-500" },
    { name: "Technical", color: "bg-green-500" },
    { name: "Limits", color: "bg-purple-500" },
  ]);

  const addTag = (name: string, color: string) => {
    setTags((prev) => [...prev, { name, color }]);
  };

  const deleteTag = (name: string) => {
    setTags((prev) => prev.filter((tag) => tag.name !== name));
  };

  const editTag = (oldName: string, newName: string) => {
    setTags((prev) =>
      prev.map((tag) =>
        tag.name === oldName ? { ...tag, name: newName } : tag
      )
    );
  };

  return { tags, addTag, deleteTag, editTag };
}
