<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status: string;
}>();

const label = computed(() => {
  const labels: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
  };
  return labels[props.status] || props.status;
});
</script>

<template>
  <span class="status-badge" :class="`status-${status}`">
    <span class="status-dot"></span>
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-active {
  background: rgba(34, 211, 238, 0.12);
  color: $status-active;
  .status-dot {
    background: $status-active;
  }
}

.status-completed {
  background: rgba(74, 222, 128, 0.12);
  color: $status-completed;
  .status-dot {
    background: $status-completed;
  }
}

.status-todo {
  background: rgba(245, 158, 11, 0.12);
  color: $status-todo;
  .status-dot {
    background: $status-todo;
  }
}

.status-in_progress {
  background: rgba(99, 102, 241, 0.12);
  color: $status-in-progress;
  .status-dot {
    background: $status-in-progress;
  }
}

.status-done {
  background: rgba(74, 222, 128, 0.12);
  color: $status-done;
  .status-dot {
    background: $status-done;
  }
}
</style>
