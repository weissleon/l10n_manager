<script setup lang="ts">
defineProps<{
    filePath: string
    index: number
}>()

defineEmits<{
    (e:"remove", index: number): void
}>()

</script>


<template>
    <div class="flex min-w-52 rounded-md bg-slate-200 px-4 py-2 items-center justify-end">
        <li class="text-right">{{filePath}}</li>
        <button @click='$emit("remove", index)'>
            <font-awesome-icon class="p-2 rounded-full hover:bg-slate-100 hover:shadow-md" icon="fa-trash"/>
        </button>
    </div>
</template>