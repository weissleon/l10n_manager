<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    text: string
    isActivated: boolean
}>()

const className = computed(() => `bg-white w-full flex items-center justify-center py-1 ${props.isActivated ? "bg-blue-200" : ""}`)



</script>



<template>
    <div :class="className">
        <p>{{ text }}</p>
    </div>
</template>