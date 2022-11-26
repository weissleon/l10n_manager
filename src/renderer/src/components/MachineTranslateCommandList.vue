<script setup lang="ts">
const TXT_BTN_LOAD_TEXT_FILE = 'Load Text File'

const buttonList = [
  {
    text: TXT_BTN_LOAD_TEXT_FILE,
    onClick: () => {
      window.api.mt.loadTextFile()
    }
  }
]
</script>

<template>
  <div class="grid items-start justify-center w-full h-full px-2 py-2 bg-yellow-200 auto-cols-fr">
    <button
      class="w-full h-auto p-2 rounded-md hover:bg-slate-200 active:bg-slate-300 bg-slate-100"
      v-for="button in buttonList"
      @click="button.onClick"
    >
      {{ button.text }}
    </button>
  </div>
</template>
