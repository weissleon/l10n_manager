<script setup lang="ts">
defineProps<{
    modelValue: string
}>()

defineEmits<{
    (e: "update:modelValue", text: string)
}>()


</script>

<template>
    <div>
        <input :value="modelValue"
            @keydown.enter="$emit('update:modelValue', ($event.target as HTMLInputElement).value.toLowerCase())"
            type="text">
    </div>

</template>