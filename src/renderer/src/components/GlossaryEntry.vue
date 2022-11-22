<script setup lang="ts">
defineProps<{
    modelValue: string
}>()

defineEmits<{
    (e: "update:modelValue", text: string)
}>()


</script>

<template>
    <div class="w-full">
        <input class="w-full" :value="modelValue"
            @keydown.enter="$emit('update:modelValue', ($event.target as HTMLInputElement).value.toLowerCase())"
            type="text">
    </div>

</template>