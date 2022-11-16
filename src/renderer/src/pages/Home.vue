<script setup lang="ts">
  const TXT_CONVERT_TEXT_FILE_FORMAT = "Convert Text File Format"


</script>

<template>
  <section class="relative flex justify-center p-4">
    <h1 class="text-orange-600 font-bold text-4xl">STOVE L10N MANAGER</h1>
  </section>
  <section class="relative flex justify-center">
    <router-link to="/convert" class="shadow-sm rounded-md py-2 px-4 hover:shadow-md hover:bg-slate-100 select-none">{{TXT_CONVERT_TEXT_FILE_FORMAT}}</router-link>


  </section>
</template>
