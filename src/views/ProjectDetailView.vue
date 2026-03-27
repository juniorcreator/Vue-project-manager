<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useTasksStore } from "@/stores/tasks.ts";
import { tasksColumns } from "@/constants/table.ts";
import { useItemModal } from "@/composables/useItemModal.ts";
import { useProjectsStore } from "@/stores/projects.ts";
import { useRoute } from "vue-router";
import { projectsApi } from "@/api/projects.ts";
import type { Task, TaskStatus } from "@/types";
import AppModal from "@/components/AppModal.vue";
import TaskForm from "@/components/TaskForm.vue";
import DataTable from "@/components/DataTable.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import KanbanBoard from "@/components/KanbanBoard.vue";
import { formatDate } from "@/utils/formatters.ts";

const route = useRoute();
const tasksStore = useTasksStore();
const projectsStore = useProjectsStore();

const {
  showModal: showTaskModal,
  showDeleteModal,
  editingItem: editingTask,
  itemToDelete: taskToDelete,
  openModal: openEditTask,
  closeModal: closeTaskModal,
  confirmDelete: confirmDeleteTask,
  closeDeleteModal,
} = useItemModal<Task>();

const projectId = computed<string>(() => {
  return route.params.id as string;
});
const project = computed(() => projectsStore.projects.find((proj) => proj.id === projectId.value));
const projectName = ref("");
const projectDesc = ref("");

onMounted(async () => {
  await tasksStore.fetchTasks(projectId.value);

  if (project.value) {
    projectName.value = project.value.name;
    projectDesc.value = project.value.description || "";
  } else {
    try {
      const { data } = await projectsApi.getById(projectId.value);
      projectName.value = data.name;
      projectDesc.value = data.description || "";
    } catch (e) {
      console.error("Failed to fetch project:", e);
    }
  }
});

const handleReorder = (rows: Task[]) => {
  tasksStore.reorderTasks(rows);
};

const handleKanbanUpdate = async (updatedTasks: Task[]) => {
  await tasksStore.reorderTasks(updatedTasks);
};

const handleTaskSubmit = async (data: {
  title: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
}) => {
  if (editingTask.value) {
    await tasksStore.updateTask(editingTask.value.id, data);
  } else {
    await tasksStore.createTask({
      projectId: projectId.value,
      title: data.title,
      assignee: data.assignee,
      status: data.status,
      dueDate: data.dueDate,
      order: tasksStore.tasks.length,
    });
  }
  closeTaskModal();
};
console.log(projectId.value, " projectId");

const executeDeleteTask = async () => {
  if (taskToDelete.value) {
    await tasksStore.deleteTask(taskToDelete.value.id);
    closeDeleteModal();
  }
};
</script>
<template>
  <div class="project-detail container">
    <div class="page-header">
      <div class="header-left">
        <button class="btn-secondary back-btn" @click="$router.push('/')">
          <i class="pi pi-arrow-circle-left"></i> Back
        </button>
        <div class="project-info" v-if="project || projectName">
          <h1>Project: {{ project?.name || projectName }}</h1>
          <p class="project-desc" v-if="project?.description || projectDesc">
            {{ project?.description || projectDesc }}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <div class="view-toggle">
          <button
            :class="{ active: tasksStore.viewMode === 'table' }"
            @click="tasksStore.setViewMode('table')"
          >
            <i class="pi pi-table"></i> Table
          </button>
          <button
            :class="{ active: tasksStore.viewMode === 'kanban' }"
            @click="tasksStore.setViewMode('kanban')"
          >
            <i class="pi pi-barcode"></i> Kanban
          </button>
        </div>
        <button @click="showTaskModal = true" class="btn-primary">
          <i class="pi pi-plus-circle"></i> Add Task
        </button>
      </div>
    </div>

    <div v-if="tasksStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <template v-else-if="tasksStore.viewMode === 'table'">
      <div class="filters-bar">
        <div class="filter-group">
          <i class="pi pi-search"></i>
          <input
            type="text"
            placeholder="Filter by assignee..."
            :value="tasksStore.filterAssignee"
            @input="tasksStore.setFilterAssignee(($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="filter-group">
          <select
            :value="tasksStore.filterStatus"
            @change="tasksStore.setFilterStatus(($event.target as HTMLSelectElement).value as any)"
          >
            <option value="">All Statuses</option>
            <option value="active">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Done</option>
          </select>
        </div>
      </div>

      <DataTable
        :columns="tasksColumns"
        :rows="tasksStore.filteredAndSortedTasks"
        :sort-key="tasksStore.sortKey"
        :sort-order="tasksStore.sortOrder"
        :is-draggable="true"
        storage-key="tasks-table"
        @sort="(key, order) => tasksStore.setSort(key, order)"
        @reorder="handleReorder"
        @row-click="openEditTask"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #cell-dueDate="{ value }">
          {{ formatDate(value) }}
        </template>
        <template #cell-actions="{ row }">
          <button
            @click.stop="confirmDeleteTask(row as Task)"
            class="btn-icon text-danger"
            title="Delete Project"
          >
            <i class="pi pi-delete-left"></i>
          </button>
        </template>
      </DataTable>
    </template>
    <template v-else>
      <KanbanBoard
        :tasks="tasksStore.tasks"
        @update-tasks="handleKanbanUpdate"
        @edit-task="openEditTask"
        @delete-task="confirmDeleteTask"
      />
    </template>

    <AppModal :show="showTaskModal" :title="editingTask ? 'Edit Task' : 'Add Task'" @close="closeTaskModal">
      <TaskForm
        @submit="handleTaskSubmit"
        :editing="editingTask"
        @cancel="closeTaskModal"
        :assignees="tasksStore.assignees"
      />
    </AppModal>

    <AppModal :show="showDeleteModal" title="Delete Task" @close="showDeleteModal = false">
      <div v-if="taskToDelete" class="delete-confirmation">
        <p>
          Sure you want to delete the task <strong>{{ taskToDelete.title }}</strong
          >?
        </p>
        <div class="form-actions mt-4">
          <button type="button" class="btn-secondary" @click="closeDeleteModal">Cancel</button>
          <button type="button" class="btn-danger" @click="executeDeleteTask">Delete</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;
.project-detail {
  padding-top: $space-10;
  padding-bottom: $space-10;
}

.page-header {
  flex-direction: column;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: $space-5;
  margin-bottom: $space-4;
  width: 100%;
}

.back-btn {
  flex-shrink: 0;
}

.project-info {
  h1 {
    margin-bottom: $space-1;
  }
}

.project-desc {
  font-size: $font-size-lg;
  color: $text-muted;
  max-width: 500px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $space-4;
  width: 100%;
  justify-content: space-between;
}

.view-toggle {
  display: flex;
  background: $bg-glass;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  overflow: hidden;

  button {
    @include button-base;
    border-radius: 0;
    border: none;
    background: transparent;
    color: $text-muted;
    gap: $space-2;
    padding: $space-2 $space-4;

    &.active {
      background: $accent-gradient;
      color: white;
    }

    &.hover:not(.active) {
      color: $text-primary;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
