export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  projectManager: User;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assignedTo: User | null;
  status: 'pending' | 'in-progress' | 'pending-review' | 'completed';
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  recurringInterval?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task_update' | 'mention' | 'status_change';
  read: boolean;
  createdAt: string;
}