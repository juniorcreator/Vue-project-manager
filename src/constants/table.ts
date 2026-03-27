export const columns = [
  { key: "id", label: "ID", sortable: true, width: 50, minWidth: 20 },
  {
    key: "name",
    label: "Project Name",
    sortable: true,
    width: 280,
    minWidth: 150,
  },
  {
    key: "taskCount",
    label: "Tasks",
    sortable: true,
    width: 60,
    minWidth: 30,
  },
  { key: "status", label: "Status", sortable: true, width: 100, minWidth: 50 },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    width: 150,
    minWidth: 70,
  },
  { key: "actions", label: "Actions", sortable: true, width: 60, minWidth: 50 },
];
export const tasksColumns = [
  { key: "id", label: "ID", sortable: true, width: 70, minWidth: 50 },
  { key: "title", label: "Task Name", sortable: true, width: 280, minWidth: 150 },
  { key: "assignee", label: "Assignee", sortable: true, width: 140, minWidth: 100 },
  { key: "status", label: "Status", sortable: true, width: 140, minWidth: 120 },
  { key: "dueDate", label: "Due Date", sortable: true, width: 140, minWidth: 110 },
  { key: "actions", label: "", sortable: false, width: 60, minWidth: 60 },
];
