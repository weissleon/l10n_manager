<script setup lang="ts">
import GlossaryEntry from "./GlossaryEntry.vue";
let { modelValue } = defineProps<{
    modelValue: string[]
}>()

defineEmits<{
    (e: "update:modelValue", modelValue: string[])
}>()


</script>

<template>
    <div class="bg-blue-400 h-full flex flex-col">
        <GlossaryEntry v-for="(_, i) in modelValue" v-model="modelValue[i]"></GlossaryEntry>
    </div>

</template>