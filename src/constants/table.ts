import type { TaskStatus } from "@/types";

export const columns = [
  { key: "id", label: "ID", sortable: true, width: 50, minWidth: 20 },
  {
    key: "name",
    label: "Project Name",
    sortable: true,
    width: 280,
    minWidth: 50,
  },
  {
    key: "taskCount",
    label: "Tasks",
    sortable: true,
    width: 60,
    minWidth: 15,
  },
  { key: "status", label: "Status", sortable: true, width: 100, minWidth: 50 },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    width: 150,
    minWidth: 70,
  },
  { key: "actions", label: "Actions", sortable: false, width: 25, minWidth: 20 },
];
export const tasksColumns = [
  { key: "id", label: "ID", sortable: true, width: 70, minWidth: 50 },
  { key: "title", label: "Task Name", sortable: true, width: 280, minWidth: 150 },
  { key: "assignee", label: "Assignee", sortable: true, width: 140, minWidth: 100 },
  { key: "status", label: "Status", sortable: true, width: 140, minWidth: 120 },
  { key: "dueDate", label: "Due Date", sortable: true, width: 140, minWidth: 110 },
  { key: "actions", label: "", sortable: false, width: 60, minWidth: 60 },
];
export const kanbanColumns = [
  { status: "todo" as TaskStatus, label: "To Do" },
  { status: "in_progress" as TaskStatus, label: "In Progress" },
  { status: "done" as TaskStatus, label: "Done" },
];
