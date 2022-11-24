<script setup lang="ts">
import GlossaryEntry from "./GlossaryEntry.vue";
const props = defineProps<{
    entries: { [key: string]: { text: string, count: number } }
}>()

const emits = defineEmits<{
    (e: "update:entry", newEntry: { key: string; newText: string })
}>()

const updateEntry = (newEntry: { key: string; newText: string }): any => {
    emits('update:entry', newEntry)
}


</script>

<template>
    <div class="bg-blue-400 h-full flex flex-col overflow-y-auto justify-start items-center">
        <GlossaryEntry v-for="(entry, key) in props.entries" :key="key" :entry="{ ...entry, key: (key as string) }"
            @update:entry="updateEntry"></GlossaryEntry>
    </div>

</template>