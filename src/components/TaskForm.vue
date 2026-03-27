<script setup lang="ts">
import { computed, reactive, watchEffect, onMounted } from "vue";
import type { Task, TaskStatus } from "@/types";

const props = defineProps<{
  editing?: Task | null;
  assignees?: string[];
}>();

const emit = defineEmits<{
  submit: [data: { title: string; assignee: string; status: TaskStatus; dueDate: string }];
  cancel: [];
}>();

const today = new Date().toISOString().split("T")[0];
const allAssignees = computed(() => {
  const base = props.assignees || [];
  return [...new Set([...base, "Kolya", "Serhii", "Luda", "Makaka"])];
});

onMounted(() => {
  console.log(props.assignees, "props.assignees mounted");
});
const formData = reactive({
  title: "",
  assignee: "",
  status: "" as TaskStatus | "",
  dueDate: "",
});

const errors = reactive({
  title: "",
  status: "",
  dueDate: "",
});

const validate = (): boolean => {
  let valid = true;
  errors.title = "";
  errors.status = "";
  errors.dueDate = "";

  if (formData.title.length < 3 || formData.title.length > 120) {
    errors.title = "Title must be between 3 and 120 characters";
    valid = false;
  }
  if (!formData.status) {
    errors.status = "Status is required";
    valid = false;
  }
  if (!formData.dueDate) {
    errors.dueDate = "Due date is required";
    valid = false;
  } else if (formData.dueDate < today && !props.editing) {
    errors.dueDate = "Due date must be today or later";
    valid = false;
  }

  return valid;
};

watchEffect(() => {
  if (props.editing) {
    formData.title = props.editing.title;
    formData.assignee = props.editing.assignee;
    formData.status = props.editing.status;
    formData.dueDate = props.editing.dueDate;
  }
});

const handleSubmit = () => {
  if (!validate()) return;

  emit("submit", {
    title: formData.title,
    assignee: formData.assignee,
    status: formData.status as TaskStatus,
    dueDate: formData.dueDate,
  });
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="task-form">
    <div class="form-group">
      <label for="task-title">Title <span class="required">*</span></label>
      <input
        id="task-title"
        v-model="formData.title"
        type="text"
        placeholder="Enter task title (3-120 characters)"
        :class="{ error: errors.title }"
        maxlength="120"
        minlength="3"
      />
      <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
    </div>
    <div class="form-group">
      <label for="task-assignee">Assignee</label>
      <select id="task-assignee" v-model="formData.assignee">
        <option value="">— Unassigned —</option>
        <option v-for="assignees in allAssignees" :key="assignees" :value="assignees">{{ assignees }}</option>
      </select>
    </div>
    <div class="form-group">
      <label for="task-status">Status <span class="required">*</span></label>
      <select id="task-status" v-model="formData.status" :class="{ error: errors.status }">
        <option value="">— Select status —</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
    </div>
    <div class="form-group">
      <label for="task-due">Due Date <span class="required">*</span></label>
      <input
        id="task-due"
        v-model="formData.dueDate"
        type="date"
        :min="today"
        :class="{ error: errors.dueDate }"
      />
      <span v-if="errors.dueDate" class="field-error">{{ errors.dueDate }}</span>
    </div>
    <div class="form-actions">
      <button @click="$emit('cancel')" class="btn-secondary" type="button">Cancel</button>
      <button class="btn-primary" type="submit">{{ editing ? "Update task" : "Create Task" }}</button>
    </div>
  </form>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.task-form {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-secondary;
  }

  .required {
    color: $danger;
  }

  input,
  select {
    @include input-base;
  }

  select {
    appearance: none;
    padding-right: 36px;
  }

  input.error,
  select.error {
    border-color: $danger;
  }

  .field-error {
    font-size: $font-size-xs;
    color: $danger;
  }

  .form-actions {
    display: flex;
    gap: $space-3;
    justify-content: flex-end;
    padding-top: $space-4;
    border-top: 1px solid $border-color;
  }
}
</style>
