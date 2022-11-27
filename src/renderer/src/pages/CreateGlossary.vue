<script setup lang="ts">
import GlossaryList from '@renderer/components/GlossaryList.vue';
import TextSegmentEntry from '@renderer/components/TextSegmentEntry.vue';
import { computed, ref } from 'vue';
import TextSegmentViewer from "../components/TextSegmentViewer.vue";
const TXT_TITLE = `Create Glossary`
const TXT_LOAD_TEXT_LIST = "Load Texts"
const TXT_TITLE_GLOSSARY = "Glossary"
const TXT_BTN_EXPORT_GLOSSARY = "Export Glossary"
const glossarySourceTexts = ref<{ key: string, text: string }[]>([])
const glossaryEntries = ref<{ [key: string]: { text: string, count: number } }>({})
const glossaryEntriesCache = ref<string[]>([])
const inputEntry = ref<string>("")
const currentIndex = ref<number>(0)

const viewerTexts = computed(() => glossarySourceTexts.value.map((value) => value.text))

const addGlossaryEntry = async (e: Event) => {
    const { value } = (e.target as HTMLInputElement)
    if (value === "") return
    if (!glossaryEntriesCache.value.includes(value.toLowerCase())) {
        const entry = await window.api.glossary.addGlossaryEntry(value)
        glossaryEntries.value[entry.key] = { text: entry.text, count: entry.count }
        glossaryEntriesCache.value.push(value.toLowerCase())
        inputEntry.value = ""
    }

}

const loadSourceTexts = async () => {
    const result = await window.api.glossary.loadSourceTexts()
    glossarySourceTexts.value = result
}

const updateGlossary = async (newEntry: { key: string, newText: string }) => {
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

</script>



<template>
    <!-- header -->
    <div class="grid grid-flow-col grid-cols-[1fr_2fr_1fr] grid-rows-[56px_1fr] w-full h-screen">
        <header class="grid grid-cols-3 col-start-1 col-end-4 h-full w-full">
            <section class="grid items-center p-2 justify-start">
                <router-link to="/">
                    <font-awesome-icon class="p-2 rounded-full text-slate-800 hover:bg-slate-100 hover:shadow-md"
                        icon="fa-arrow-left" />
                </router-link>
            </section>
            <section id="title" class="flex justify-center items-center">
                <h1 class="text-2xl font-bold text-orange-600">
                    {{ TXT_TITLE }}
                </h1>
            </section>
            <section id="options-panel" class="flex justify-end p-2">
                <button>
                    <font-awesome-icon class="p-2 rounded-full text-slate-800 hover:bg-slate-100 hover:shadow-md"
                        icon="fa-gear" />
                </button>
            </section>
        </header>

        <!-- left section -->
        <section
            class="bg-purple-400 grid overflow-hidden h-full w-full grid-rows-[auto_1fr] justify-center row-start-2 row-end-3 col-start-1 col-end-2">
            <section class="row-start-1 row-end-2 flex w-full justify-center">
                <button @click="loadSourceTexts"
                    class="p-2 rounded-md hover:bg-yellow-300 active:bg-yellow-500 bg-yellow-400">{{
                            TXT_LOAD_TEXT_LIST
                    }}</button>
            </section>
            <section class="row-start-2 row-end-3 flex flex-col overflow-y-auto justify-start items-center h-full">
                <TextSegmentEntry v-for="(sourceText, index) in glossarySourceTexts" :text="sourceText.text"
                    :key="sourceText.key" :is-activated="index === currentIndex" />
            </section>
        </section>
        <section
            class="flex gap-y-40 flex-col w-full items-center flex-wrap justify-center row-start-2 row-end-3 col-start-2 col-end-3">
            <TextSegmentViewer v-model:current-index="currentIndex" :texts="viewerTexts"
                :glossary="glossaryEntriesCache" />
            <input class="text-2xl border-slate-200 border-2 rounded-md p-4" @keydown.enter="addGlossaryEntry"
                id="input-entry" v-model="inputEntry" placeholder="Enter the entry" type="text">
        </section>

        <!-- right section -->
        <section
            class="grid overflow-hidden h-full w-full grid-rows-[auto_1fr] row-start-2 row-end-3 col-start-3 col-end-4">
            <section class="flex items-center gap-4">
                <h1>{{ TXT_TITLE_GLOSSARY }}</h1>
                <button @click="exportGlossary" class="p-2 bg-red-400 rounded-md">{{ TXT_BTN_EXPORT_GLOSSARY }}</button>
            </section>

            <section class="overflow-y-auto">
                <GlossaryList :entries="glossaryEntries" @update:entry="updateGlossary" />
            </section>
        </section>
    </div>

</template>
