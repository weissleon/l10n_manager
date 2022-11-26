<script setup lang="ts">
import MachineTranslateCommandList from '@renderer/components/MachineTranslateCommandList.vue'

const TXT_TITLE = 'MACHINE TRANSLATION'

const translateSingleText = async () => {
  await window.api.mt.translateSingleText('Hello World')
}
</script>

<template>
  <div class="grid w-screen h-screen grid-rows-[auto_1fr_auto]">
    <header class="grid w-full grid-cols-3 bg-blue-200 h-14">
      <div class="grid items-center justify-center col-start-2 col-end-3 bg-purple-200">
        <h1 class="text-2xl font-bold">
          {{ TXT_TITLE }}
        </h1>
      </div>
    </header>
    <main class="grid grid-cols-[auto_1fr_1fr] w-full">
      <MachineTranslateCommandList />
      <div class="relative grid w-full h-full grid-rows-2">
        <section class="relative grid grid-rows-[1fr_auto] w-full h-full row-start-1 row-end-2">
          <textarea
            class="relative w-full h-full p-2 resize-none"
            placeholder="Type in text to translate"
          />
          <button
            @click="translateSingleText"
            class="relative px-2 py-1 bg-green-200 rounded-md focus:bg-green-300 active:bg-green-400"
          >
            Translate
          </button>
        </section>
        <section class="relative w-full h-full row-start-2 row-end-3">
          <textarea class="absolute w-full h-full p-2 resize-none" readonly />
        </section>
      </div>
    </main>
    <footer class="w-full bg-blue-200 h-14">
      <h3>This is a Footer</h3>
    </footer>
  </div>
</template>
