<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  margin-bottom: 1.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
  border: 1px solid #dbdbdb;
  color: orange;
}
</style>
