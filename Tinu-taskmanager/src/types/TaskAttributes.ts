interface Tag {
  name: string;
  color: string;
  // ... other tag properties if any
}

export interface TaskAttributes {
  userId: string;
  id: string;
  task: string;
  description?: string;
  status: "Completed" | "In-Progress" | "Planned";
  tags: Tag[];
  dueDate: string | Date;
  priority: string;
  showDescriptionOnCard: boolean;
  showChecklistOnCard: boolean;
  checklist?: { id: string; text: string; completed: boolean }[]; // Allow undefined
}
