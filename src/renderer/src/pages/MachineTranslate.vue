<script setup lang="ts">
import MachineTranslateCommandList from '@renderer/components/MachineTranslateCommandList.vue'
import { ref } from 'vue'

const TXT_TITLE = 'MACHINE TRANSLATION'
const sourceText = ref<string>('')
const translatedText = ref<string>('')
const modalOpen = ref<boolean>(false)

const buttonProps = [
  {
    text: 'Load Text File',
    onClick: () => {
      modalOpen.value = !modalOpen.value
      window.api.mt.loadTextFile()
    }
  },
  {
    text: 'Begin Translation',
    onClick: async () => {
      const result = await window.api.mt.translateTextFile()
    }
  }
]

const translateSingleText = async () => {
  if (sourceText.value === '') return

  const result = await window.api.mt.translateSingleText(sourceText.value)
  console.log(result)
  translatedText.value = result
}
</script>

<template>
  <div class="grid w-screen h-screen grid-rows-[auto_1fr_auto]">
    <Teleport to="body">
      <div
        @click="modalOpen = false"
        v-if="modalOpen"
        class="absolute top-0 left-0 w-full h-full bg-lime-400"
      >
        Hello Modal
      </div>
    </Teleport>
    <header class="grid w-full grid-cols-3 bg-blue-200 h-14">
      <div class="grid items-center justify-center col-start-2 col-end-3 bg-purple-200">
        <h1 class="text-2xl font-bold">
          {{ TXT_TITLE }}
        </h1>
      </div>
    </header>
    <main class="grid grid-cols-[auto_1fr_1fr] w-full">
      <MachineTranslateCommandList :button-props="buttonProps" />
      <div class="relative grid w-full h-full grid-rows-2">
        <section class="relative grid grid-rows-[1fr_auto] w-full h-full row-start-1 row-end-2">
          <textarea
            v-model="sourceText"
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
          <textarea class="relative w-full h-full p-2 resize-none" readonly>{{
            translatedText
          }}</textarea>
        </section>
      </div>
    </main>
    <footer class="w-full bg-blue-200 h-14">
      <h3>This is a Footer</h3>
    </footer>
  </div>
</template>
