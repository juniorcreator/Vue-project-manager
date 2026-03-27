<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Task, TaskStatus } from "@/types";
import { useSortable } from "@vueuse/integrations/useSortable";
import StatusBadge from "./StatusBadge.vue";
import { kanbanColumns } from "@/constants/table.ts";

const props = defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  updateTasks: [tasks: Task[]];
  editTask: [task: Task];
  deleteTask: [task: Task];
}>();

const tasksByStatus = computed(() => {
  const grouped: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  const sorted = [...props.tasks].sort((a, b) => a.order - b.order);
  for (const task of sorted) {
    grouped[task.status].push({ ...task });
  }
  return grouped;
});

const getColumnTasks = (status: TaskStatus): Task[] => {
  return tasksByStatus.value[status];
};

const columnRefs = ref<HTMLElement[]>([]);

const syncAllTasksFromDOM = () => {
  const allTasks: Task[] = [];

  columnRefs.value.forEach((colEl) => {
    const status = colEl.getAttribute("data-status") as TaskStatus;
    if (!status) return;
    const cardEls = colEl.querySelectorAll(".kanban-card");
    cardEls.forEach((cardEl, idx) => {
      const id = cardEl.getAttribute("data-id");
      if (!id) return;

      const originalTask = props.tasks.find((t) => t.id === id);
      if (originalTask) {
        allTasks.push({
          ...originalTask,
          status,
          order: idx,
        });
      }
    });
  });

  emit("updateTasks", allTasks);
};

watch(
  columnRefs,
  (newRefs) => {
    if (newRefs && newRefs.length > 0) {
      newRefs.forEach((el) => {
        useSortable(el, ref([]), {
          group: "kanban",
          animation: 200,
          ghostClass: "ghost",
          dragClass: "dragging",
          onEnd: syncAllTasksFromDOM,
        });
      });
    }
  },
  { deep: true, immediate: true },
);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <div class="kanban-board">
    <div v-for="column in kanbanColumns" :key="column.status" class="kanban-column">
      <div class="kanban-column-header">
        <div class="column-title">
          <StatusBadge :status="column.status" />
          <span class="column-count">{{ getColumnTasks(column.status).length }}</span>
        </div>
      </div>
      <div class="kanban-cards" ref="columnRefs" :data-status="column.status">
        <div
          v-for="element in getColumnTasks(column.status)"
          :key="element.id"
          :data-id="element.id"
          class="kanban-card"
          @click="$emit('editTask', element)"
        >
          <div class="card-header">
            <div class="card-title">{{ element.title }}</div>
            <button
              class="btn-icon text-danger"
              @click.stop="$emit('deleteTask', element)"
              title="Delete Task"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
          <div class="card-meta">
            <span v-if="element.assignee" class="card-assignee">
              <i class="pi pi-user"></i>
              {{ element.assignee }}
            </span>
            <span class="card-date">
              <i class="pi pi-calendar"></i>
              {{ formatDate(element.dueDate) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-5;
  min-height: 400px;
}

.kanban-column {
  @include glass-card;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.kanban-column-header {
  padding: $space-4 $space-5;
  border-bottom: 1px solid $border-color;
}

.column-title {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.column-count {
  background: rgba(255, 255, 255, 0.08);
  color: $text-muted;
  font-size: $font-size-xs;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: $radius-full;
}

.kanban-cards {
  padding: $space-3;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  min-height: 100px;
  overflow-y: auto;
}

.kanban-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: $space-4;
  cursor: grab;
  transition: all 150ms ease;

  &:hover {
    border-color: $border-color-active;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $space-2;
  margin-bottom: $space-3;
}

.card-title {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-primary;
  line-height: 1.4;
}

.kanban-card:hover .btn-icon {
  opacity: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: $space-4;
  font-size: $font-size-xs;
  color: $text-muted;
}

.card-assignee,
.card-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.ghost) {
  opacity: 0.4;
  background: rgba(99, 102, 241, 0.1);
  border-color: $accent-primary;
}

:deep(.dragging) {
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.4);
  transform: rotate(2deg);
}
</style>
