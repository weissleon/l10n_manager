<script setup lang="ts" >
import TextSegment from "./TextSegment.vue";
import { ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
const props = defineProps<{
    texts: string[]
    glossary: string[]
    currentIndex: number
}>()

const emits = defineEmits<{
    (e: "update:currentIndex", newValue: number)
}>()

const activatedKeys = ref<string[]>([])
useEventListener(window, "keydown", (ev) => {
    if (!activatedKeys.value.includes(ev.key)) {
        activatedKeys.value.push(ev.key)
    }
})
useEventListener(window, "keyup", (ev) => {
    if (activatedKeys.value.includes(ev.key)) {
        const preList = activatedKeys.value.slice(0, activatedKeys.value.indexOf(ev.key))
        const postList = activatedKeys.value.slice(activatedKeys.value.indexOf(ev.key) + 1)
        activatedKeys.value = [...preList, ...postList]
    }
})

watch([() => [...activatedKeys.value], activatedKeys], () => {
    if (activatedKeys.value.includes("Control") && activatedKeys.value.includes("Enter") && activatedKeys.value.includes("Shift")) {
        prevIndex()
    }
    else if (activatedKeys.value.includes("Control") && activatedKeys.value.includes("Enter")) {
        nextIndex()
    }
})

const nextIndex = () => {

    if (props.currentIndex < props.texts.length - 1) emits("update:currentIndex", props.currentIndex + 1)
}

const prevIndex = () => {
    if (props.currentIndex > 0) emits("update:currentIndex", props.currentIndex - 1)
}



</script>


<template>
    <div class="flex flex-col gap-y-12 items-center">
        <section class="text-slate-300 text-2xl" id="item_before">
            <TextSegment :text="texts[currentIndex - 1]" :glossary="glossary" />
        </section>
        <section class="font-bold text-4xl" id="item_main">
            <TextSegment :text="texts[currentIndex]" :glossary="glossary" />
        </section>
        <section class="text-slate-300 text-2xl" id="item_after">
            <TextSegment :text="texts[currentIndex + 1]" :glossary="glossary" />
        </section>
    </div>
</template>

