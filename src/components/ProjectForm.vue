<script setup lang="ts">
import type { Project } from "@/types";
import { reactive, watchEffect } from "vue";

const props = defineProps<{
  editing?: Project | null;
}>();

const emit = defineEmits<{
  submit: [data: { name: string; description: string }];
  cancel: [];
}>();

const formData = reactive({
  name: "",
  description: "",
});

const errors = reactive({
  name: "",
});

watchEffect(() => {
  if (props.editing) {
    formData.name = props.editing.name;
    formData.description = props.editing.description;
  }
});

const validate = (): boolean => {
  errors.name = "";
  if (!formData.name.trim()) {
    errors.name = "Project name required";
    return false;
  }
  return true;
};

const handleSubmit = () => {
  if (!validate()) return;
  emit("submit", {
    name: formData.name.trim(),
    description: formData.description.trim(),
  });
  console.log(formData);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="project-form" action="">
    <div class="form-group">
      <label for="project-name">Project name <span class="required">*</span></label>
      <input
        v-model="formData.name"
        id="project-name"
        type="text"
        placeholder="Enter project name"
      />
      <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
    </div>
    <div class="form-group">
      <label for="project-desc">Description</label>
      <textarea
        v-model="formData.description"
        id="project-desc"
        placeholder="Enter proj desc"
        rows="4"
      ></textarea>
    </div>
    <div class="form-actions">
      <button @click.self="$emit('cancel')" type="button" class="btn-secondary">Cancel</button>
      <button type="submit" class="btn-primary">
        {{ editing ? "Update Project" : "Create Project" }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;
.project-form {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

label {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-secondary;
}

.required {
  color: $danger;
}

input,
textarea {
  padding: $space-2 $space-3;
  background-color: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  font-size: $font-size-sm;
  transition: border-color 150ms ease;
}

.textarea {
  resize: vertical;
  min-height: 60px;
}

input.error,
textarea.error {
  border-color: $danger;
}

.field-error {
  font-size: $font-size-xs;
  color: $danger;
}
</style>
