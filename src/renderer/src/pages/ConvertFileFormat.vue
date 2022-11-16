<script setup lang="ts">
import FileItem from '@renderer/components/FileItem.vue';
import { ref } from 'vue';

const TXT_BTN_LOAD_FILE = "Load Text File"
const TXT_BTN_CONVERT = "Convert"
const textFilePaths = ref<string[]>([])

const importFiles = async () =>{
     textFilePaths.value =  await window.api.addFilePaths()
}

const removeFile = async (index: number) => {
    console.log(`${index} removed!`)
}

const convertFiles = async () => {
    const result = await window.api.convertTextFiles()

    console.log(result)
}

</script>


<template>
    <header class="p-4">
        <router-link to="/">
            <font-awesome-icon class="p-2 rounded-full hover:bg-slate-100 hover:shadow-md" icon="fa-arrow-left"/>
        </router-link>
    </header>
    <section class="flex justify-center">
        <h1 class="">Convert Text File Format</h1>
    </section>
    <main class="flex flex-col items-center justify-center">
        <button class="shadow-sm rounded-md py-2 px-4 hover:shadow-md hover:bg-slate-100 select-none" @click="importFiles">{{TXT_BTN_LOAD_FILE}}</button>
        <ul class="flex flex-col gap-2">
            <FileItem :index="index" @remove="removeFile"  v-for="(textFilePath, index) in textFilePaths" :file-path="textFilePath"/>
        </ul>
        <button class="shadow-sm rounded-md py-2 px-4 hover:shadow-md hover:bg-slate-100 select-none" @click="convertFiles">{{TXT_BTN_CONVERT}}</button>
    </main>

</template>