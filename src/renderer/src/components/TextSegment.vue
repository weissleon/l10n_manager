<script setup lang="ts">
import { computed } from "vue";


const props = defineProps<{
    text?: string
    glossary: string[]
}>()


const regex = computed(() => props.glossary?.join('|'))


// const highlightedText = computed(() => text !== undefined && regex.value === "" ? text : text?.replace(new RegExp(regex.value, 'gi'), '<span class="bg-yellow-400">$&</span>'))
const highlightedText = computed(() => props.text !== undefined && regex.value === "" ? props.text : props.text?.replace(new RegExp(regex.value, 'gi'), '<span class="bg-yellow-400">$&</span>'))




</script>



<template>
    <div v-html="highlightedText" class="min-h-[3rem]">
    </div>
</template>

