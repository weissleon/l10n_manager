<script setup lang="ts">
import GlossaryList from '@renderer/components/GlossaryList.vue'
import TextSegmentEntry from '@renderer/components/TextSegmentEntry.vue'
import { computed, ref } from 'vue'
import TextSegmentViewer from '../components/TextSegmentViewer.vue'
const TXT_TITLE = `Create Glossary`
const TXT_LOAD_TEXT_LIST = 'Load Texts'
const TXT_TITLE_GLOSSARY = 'Glossary'
const TXT_BTN_EXPORT_GLOSSARY = 'Export Glossary'
const TXT_BTN_POSTPROCESS_GLOSSARY = 'Postprocess'
const glossarySourceTexts = ref<{ key: string; text: string }[]>([])
const glossaryEntries = ref<{ [key: string]: { text: string; count: number } }>({})
const glossaryEntriesCache = ref<string[]>([])
const inputEntry = ref<string>('')
const currentIndex = ref<number>(0)

const viewerTexts = computed(() => glossarySourceTexts.value.map((value) => value.text))

const addGlossaryEntry = async (e: Event) => {
  const { value } = e.target as HTMLInputElement
  if (value === '') return
  if (!glossaryEntriesCache.value.includes(value.toLowerCase())) {
    const entry = await window.api.glossary.addGlossaryEntry(value)
    glossaryEntries.value[entry.key] = { text: entry.text, count: entry.count }
    glossaryEntriesCache.value.push(value.toLowerCase())
    inputEntry.value = ''
  }
}

const loadSourceTexts = async () => {
  const result = await window.api.glossary.loadSourceTexts()
  glossarySourceTexts.value = result
}

const updateGlossary = async (newEntry: { key: string; newText: string }) => {
  const { key, newText } = newEntry
  console.log(key, newText)
  const oldText = glossaryEntries.value[key].text
  const entry = await window.api.glossary.updateGlossaryEntry(key, newText)
  glossaryEntries.value[entry.key] = { text: entry.text, count: entry.count }
  glossaryEntriesCache.value[glossaryEntriesCache.value.indexOf(oldText)] = entry.text
}

const exportGlossary = async () => {
  window.api.glossary.exportGlossary()
}

const postprocessGlossary = async () => {
  window.api.glossary.postprocessGlossary()
}
</script>

<template>
  <!-- header -->
  <div class="grid grid-flow-col grid-cols-[1fr_2fr_1fr] grid-rows-[56px_1fr] w-full h-screen">
    <header class="grid w-full h-full grid-cols-3 col-start-1 col-end-4">
      <section class="grid items-center justify-start p-2">
        <router-link to="/">
          <font-awesome-icon
            class="p-2 rounded-full text-slate-800 hover:bg-slate-100 hover:shadow-md"
            icon="fa-arrow-left"
          />
        </router-link>
      </section>
      <section id="title" class="flex items-center justify-center">
        <h1 class="text-2xl font-bold text-orange-600">
          {{ TXT_TITLE }}
        </h1>
      </section>
      <section id="options-panel" class="flex justify-end p-2">
        <button>
          <font-awesome-icon
            class="p-2 rounded-full text-slate-800 hover:bg-slate-100 hover:shadow-md"
            icon="fa-gear"
          />
        </button>
      </section>
    </header>

    <!-- left section -->
    <section
      class="bg-purple-400 grid overflow-hidden h-full w-full grid-rows-[auto_1fr] justify-center row-start-2 row-end-3 col-start-1 col-end-2"
    >
      <section class="flex justify-center w-full row-start-1 row-end-2">
        <button
          @click="loadSourceTexts"
          class="p-2 bg-yellow-400 rounded-md hover:bg-yellow-300 active:bg-yellow-500"
        >
          {{ TXT_LOAD_TEXT_LIST }}
        </button>
      </section>
      <section
        class="flex flex-col items-center justify-start h-full row-start-2 row-end-3 overflow-y-auto"
      >
        <TextSegmentEntry
          v-for="(sourceText, index) in glossarySourceTexts"
          :text="sourceText.text"
          :key="sourceText.key"
          :is-activated="index === currentIndex"
        />
      </section>
    </section>
    <section
      class="flex flex-col flex-wrap items-center justify-center w-full col-start-2 col-end-3 row-start-2 row-end-3 gap-y-40"
    >
      <TextSegmentViewer
        v-model:current-index="currentIndex"
        :texts="viewerTexts"
        :glossary="glossaryEntriesCache"
      />
      <input
        class="p-4 text-2xl border-2 rounded-md border-slate-200"
        @keydown.enter="addGlossaryEntry"
        id="input-entry"
        v-model="inputEntry"
        placeholder="Enter the entry"
        type="text"
      />
    </section>

    <!-- right section -->
    <section
      class="grid overflow-hidden h-full w-full grid-rows-[auto_1fr] row-start-2 row-end-3 col-start-3 col-end-4"
    >
      <section class="flex items-center gap-4">
        <h1>{{ TXT_TITLE_GLOSSARY }}</h1>
        <button @click="exportGlossary" class="p-2 bg-red-400 rounded-md">
          {{ TXT_BTN_EXPORT_GLOSSARY }}
        </button>
        <button @click="postprocessGlossary" class="p-2 bg-red-400 rounded-md">
          {{ TXT_BTN_POSTPROCESS_GLOSSARY }}
        </button>
      </section>

      <section class="overflow-y-auto">
        <GlossaryList :entries="glossaryEntries" @update:entry="updateGlossary" />
      </section>
    </section>
  </div>
</template>
