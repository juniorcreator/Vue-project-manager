export type ProjectStatus = "active" | "in_progress" | "completed" | "";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  taskCount: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  order: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
}

export type SortOrder = "asc" | "desc" | null;
