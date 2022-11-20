<script setup lang="ts">
import GlossaryList from '@renderer/components/GlossaryList.vue';
import { ref } from 'vue';
import TextSegmentList from "../components/TextSegmentList.vue";


const sampleTextSegments = ref<string[]>(["Hello Denis", "Hi Denis", "Hello Dana", "Here comes Esther!"])

const textSegments = ref<string[]>([])
const glossaryEntries = ref<string[]>([])
const inputEntry = ref<string>("")

const addGlossaryEntry = (e: Event) => {
    const { value } = (e.target as HTMLInputElement)
    if (value === "") return
    if (!glossaryEntries.value.includes(value.toLowerCase())) {
        glossaryEntries.value.push(value.toLowerCase())
        inputEntry.value = ""
    }
}

const updateGlossary = (newEntries: string[]) => {
    const filteredEntries = newEntries.filter(value => !glossaryEntries.value.includes(value.toLowerCase()))

    glossaryEntries.value = filteredEntries
}


</script>



<template>
    <div class="grid grid-flow-col grid-cols-[1fr_2fr_1fr] grid-rows-[56px_1fr] h-screen">
        <header class="grid grid-cols-3 col-start-1 col-end-4">
            <section class="bg-green-400 grid items-center p-2 justify-start">
                <router-link to="/">
                    <font-awesome-icon class="p-2 rounded-full hover:bg-slate-100 hover:shadow-md"
                        icon="fa-arrow-left" />
                </router-link>
            </section>
        </header>
        <section class="bg-purple-400 flex justify-center row-start-2 row-end-3 col-start-1 col-end-2">
            hello world
        </section>
        <section
            class="flex gap-y-40 flex-col items-center  justify-center row-start-2 row-end-3 col-start-2 col-end-3">
            <TextSegmentList :texts="sampleTextSegments" :glossary="glossaryEntries" />
            <input class="text-2xl border-slate-200 border-2 rounded-md p-4" @keydown.enter="addGlossaryEntry"
                id="input-entry" v-model="inputEntry" placeholder="Enter the entry" type="text">
        </section>
        <section class="row-start-2 row-end-3 col-start-3 col-end-4">
            <GlossaryList :model-value="glossaryEntries" @update:model-value="updateGlossary" />
        </section>
    </div>

</template>
