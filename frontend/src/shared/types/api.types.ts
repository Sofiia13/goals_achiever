export interface Goal {
  id: number;
  title: string;
  context?: string;
  createdAt: Date;
  deadline?: Date;
  userId: number;
  tasks?: Task[];
  completedAt?: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "done";
  goalId: number;
  generatedAt: Date;
  dueDate?: Date;
}
