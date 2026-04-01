export class TaskModel {
  id!: string;
  name!: string;
  completed: boolean = false;
  createdAt!: number;
  priority!: TaskPriority;
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}
