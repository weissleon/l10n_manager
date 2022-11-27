<script setup lang="ts">
defineProps<{
  buttonProps: {
    text: string
    onClick: () => void
  }[]
}>()
</script>

<template>
  <div class="grid items-start justify-center w-full h-full px-2 py-2 bg-yellow-200 auto-cols-fr">
    <button
      class="w-full h-auto p-2 rounded-md hover:bg-slate-200 active:bg-slate-300 bg-slate-100"
      v-for="button in buttonProps"
      @click="button.onClick"
    >
      {{ button.text }}
    </button>
  </div>
</template>
