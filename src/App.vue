<script setup lang="ts">
import { Toaster } from "vue3-hot-toast";
</script>
<template>
  <Toaster />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
<style lang="scss">
@use "./assets/scss/main.scss";
</style>
