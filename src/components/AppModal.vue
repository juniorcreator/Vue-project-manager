<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  title: string;
  size?: "sm" | "md" | "lg";
}>();

defineEmits<{
  close: [];
}>();

const sizeClass = `modal-${props.size || "md"}`;
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div v-if="show" class="modal-content" :class="sizeClass">
          <div class="modal-header">
            <h2>{{ title }}</h2>
            <button class="modal-close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: $bg-modal-overlay;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $space-4;
}

.modal-content {
  background: $bg-glass;
  backdrop-filter: blur(12px);
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  background: $bg-card;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.modal-sm {
    max-width: 400px;
  }
  &.modal-md {
    max-width: 560px;
  }
  &.modal-lg {
    max-width: 720px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-2 $space-3;
  border-bottom: 1px solid $border-color;

  h2 {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
}

.modal-close {
  background: none;
  border: none;
  color: $text-muted;
  cursor: pointer;
  padding: $space-1;
  border-radius: $radius-sm;
  transition: all 150ms ease;
  display: flex;
  align-items: center;

  &:hover {
    color: $text-primary;
    background: rgba(255, 255, 255, 0.1);
  }
}

.modal-body {
  padding: $space-6;
  overflow-y: auto;
}
</style>
