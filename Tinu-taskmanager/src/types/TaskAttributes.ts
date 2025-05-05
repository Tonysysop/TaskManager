


interface Tag {
  name: string;
  color: string;
  // ... other tag properties if any
}



export interface TaskAttributes {
  userId: string
  id: string;
  task: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  tags: Tag[];
  dueDate: string | Date;
  priority:string
}




