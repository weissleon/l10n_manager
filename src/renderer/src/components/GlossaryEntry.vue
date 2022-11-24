<script setup lang="ts">
defineProps<{
    entry: { key: string; text: string; count: number }
}>()

defineEmits<{
    (e: "update:entry", newEntry: { key: string; newText: string })
}>()


</script>

<template>
    <div class="w-full">
        <input class="w-full" :value="entry.text"
            @keydown.enter="$emit('update:entry', { key: entry.key, newText: ($event.target as HTMLInputElement).value.toLowerCase() })"
            type="text">
        <p>{{ entry.count }}</p>
    </div>

</template>