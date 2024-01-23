<script setup>
import { RouterView } from 'vue-router'
import LanguageChoice from './components/LanguageChoice.vue';
</script>

<template>
  <header>
    <nav>
      <LanguageChoice />
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  position: fixed;
  z-index: 99999;
  width: 100%;
  pointer-events: none;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: right;
  padding: 3px;
}
</style>
