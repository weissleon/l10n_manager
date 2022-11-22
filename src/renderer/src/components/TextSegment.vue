<script setup lang="ts">
import { computed, watch } from "vue";


const props = defineProps<{
    text?: string
    glossary: string[]
}>()


const regex = computed(() => props.glossary?.join('|').replace(/\+/gi, "\\$&"))


const highlightedText = computed(() => props.text !== undefined && regex.value === "" ? props.text : props.text?.replace(new RegExp(`${regex.value}`, 'gi'), '<span class="bg-yellow-400">$&</span>').replace(/(?<!span)\s/g, "&nbsp"))

watch(highlightedText, () => {
    console.log(highlightedText.value)
})


</script>



<template>
    <div v-html="highlightedText" class="flex justify-center text-center items-center min-h-[3rem]">
    </div>
</template>

