<script setup lang="ts">
const TXT_CONVERT_TEXT_FILE_FORMAT = 'Convert Text File Format'
const TXT_CREATE_GLOSSARY = 'Create Glossary'
const TXT_MACHINE_TRANSLTE = 'Machine Translate'
</script>

<template>
  <section class="relative flex justify-center p-4">
    <h1 class="text-4xl font-bold text-orange-600">STOVE L10N MANAGER</h1>
  </section>
  <section class="relative flex flex-col items-center">
    <router-link
      to="/convert"
      class="px-4 py-2 rounded-md shadow-sm select-none hover:shadow-md hover:bg-slate-100"
    >
      {{ TXT_CONVERT_TEXT_FILE_FORMAT }}</router-link
    >
    <router-link
      to="/glossary"
      class="px-4 py-2 rounded-md shadow-sm select-none hover:shadow-md hover:bg-slate-100"
    >
      {{ TXT_CREATE_GLOSSARY }}</router-link
    >
    <router-link
      to="/translate"
      class="px-4 py-2 rounded-md shadow-sm select-none hover:shadow-md hover:bg-slate-100"
    >
      {{ TXT_MACHINE_TRANSLTE }}</router-link
    >
  </section>
</template>
