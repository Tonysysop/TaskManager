


interface Tag {
  name: string;
  color: string;
  // ... other tag properties if any
}



export interface TaskAttributes {
  id: string;
  task: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  tags: Tag[];
  dueDate: Date;
  priority:string
}




