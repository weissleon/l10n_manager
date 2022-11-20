<script setup lang="ts" >
import TextSegment from "./TextSegment.vue";
import { ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
const { texts } = defineProps<{
    texts: string[]
    glossary: string[]
}>()
const currentIndex = ref<number>(0)
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

    if (currentIndex.value < texts.length - 1) currentIndex.value++
}

const prevIndex = () => {
    if (currentIndex.value > 0) currentIndex.value--
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

