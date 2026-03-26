<script setup lang="ts">
import { ref, onMounted } from "vue";
import { tasksApi } from "@/api/tasks.ts";
import { useProjectsStore } from "@/stores/projects.ts";
import type { Project, ProjectStatus, Task } from "@/types";
import { columns } from "@/constants/table.ts";
import AppModal from "@/components/AppModal.vue";
import ProjectForm from "@/components/ProjectForm.vue";
import { useRouter } from "vue-router";
import DataTable from "@/components/DataTable.vue";
import { formatDate } from "@/helpers";
import StatusBadge from "@/components/StatusBadge.vue";
import StatsChart from "@/components/StatsChart.vue";

const router = useRouter();
const projectsStore = useProjectsStore();

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingProject = ref<Project | null>(null);
const projectToDelete = ref<Project | null>(null);
const allTasks = ref<Task[]>([]);

onMounted(async () => {
  try {
    await projectsStore.fetchProjects();
    const { data } = await tasksApi.getAll();
    allTasks.value = data;
  } catch (error) {
    console.error("onMounted error occurred", error);
  }
});

const handleReorder = (rows: Project[]) => {
  projectsStore.reorderProjects(rows);
};

const goToProject = (row: Project) => {
  router.push(`/projects/${row.id}`);
};

const closeModal = () => {
  showModal.value = false;
  editingProject.value = null;
};

const openAddProject = () => {
  editingProject.value = null;
  showModal.value = true;
};

const openEditProject = (project: Project) => {
  editingProject.value = project;
  showModal.value = true;
};

const confirmDelete = (project: Project) => {
  projectToDelete.value = project;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (projectToDelete.value) {
    await projectsStore.deleteProject(projectToDelete.value.id);
    showDeleteModal.value = false;
    projectToDelete.value = null;
  }
};

const handleCreateOrUpdate = async (data: { name: string; description: string }) => {
  if (editingProject.value) {
    await projectsStore.updateProject(editingProject.value.id, {
      name: data.name,
      description: data.description,
    });
  } else {
    await projectsStore.createProject({
      name: data.name,
      description: data.description,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      taskCount: 0,
    });
  }
  closeModal();
};
</script>
<template>
  <div class="projects-page container">
    <div class="page-header">
      <h1>Projects</h1>
      <button @click="openAddProject" class="btn-primary">+ Add Project</button>
    </div>

    <div class="stats-section" v-if="allTasks.length">
      <div class="stats-card">
        <h3>Tasks Data</h3>
        <StatsChart :tasks="allTasks" />
      </div>
      <div class="stats-numbers">
        <div class="stat-item">
          <span class="stat-value">{{ projectsStore.projects.length }}</span>
          <span class="stat-label">Projects</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ allTasks.length }}</span>
          <span class="stat-label">Total Tasks</span>
        </div>
        <div class="stat-item">
          <span class="stat-value todo">{{
            allTasks.filter((task) => task.status === "todo").length
          }}</span>
          <span class="stat-label">To Do</span>
        </div>
        <div class="stat-item">
          <span class="stat-value progress">{{
            allTasks.filter((task) => task.status === "in_progress").length
          }}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-item">
          <span class="stat-value done">{{
            allTasks.filter((task) => task.status === "done").length
          }}</span>
          <span class="stat-label">Done</span>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Search by name..."
          :value="projectsStore.filterName"
          @input="projectsStore.setFilterName(($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="filter-group">
        <select
          @change="
            projectsStore.setFilterStatus(
              ($event.target as HTMLSelectElement).value as ProjectStatus,
            )
          "
          :value="projectsStore.filterStatus"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <div v-if="projectsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>loading projects...</p>
    </div>

    <DataTable
      v-else
      :columns="columns"
      :rows="projectsStore.filteredAndSortedProjects"
      :sort-key="projectsStore.sortKey"
      :sort-order="projectsStore.sortOrder"
      storage-key="projects-table"
      :is-draggable="true"
      @sort="(key, order) => projectsStore.setSort(key, order)"
      @reorder="handleReorder"
      @row-click="goToProject"
    >
      <template #cell-status="{ value }">
        <StatusBadge :status="value" />
      </template>
      <template #cell-createdAt="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="actions-group">
          <button
            @click.stop="openEditProject(row as Project)"
            class="btn-icon text-primary"
            title="Edit Project"
          >
            <i class="pi pi-file-edit"></i>
          </button>
          <button
            @click.stop="confirmDelete(row as Project)"
            class="btn-icon text-danger"
            title="Delete Project"
          >
            <i class="pi pi-delete-left"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <AppModal
      :show="showModal"
      :title="editingProject ? 'Edit Project' : 'New Project'"
      @close="closeModal"
    >
      <ProjectForm :editing="editingProject" @submit="handleCreateOrUpdate" @cancel="closeModal" />
    </AppModal>
    <AppModal :show="showDeleteModal" title="Delete Project" @close="showDeleteModal = false">
      <div class="delete-confirmation">
        <p>
          Are you sure to delete
          <strong>{{ projectToDelete!.name }}</strong> project?
        </p>
        <div class="delete-confirmation-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-danger" @click="executeDelete">Delete</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style lang="scss" scoped>
@use "@/views/ProjectsView/ProjectsView.scss";
</style>
