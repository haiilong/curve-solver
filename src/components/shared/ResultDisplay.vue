<template>
  <div class="result-container">
    <div class="result-label">Result:</div>
    <div class="result-value" :class="{ 'has-error': result.startsWith('Error:') }">
      <div class="result-text">{{ result || fallbackMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  result: string;
  fallbackMessage?: string;
}

withDefaults(defineProps<Props>(), {
  fallbackMessage: 'Add points to solve equation',
});
</script>

<style scoped>
.result-container {
  margin: 12px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.result-label {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
}

.result-value {
  margin: 0;
  padding: 25px;
  border-radius: 8px;
  font-size: 1.6em;
  text-align: center;
  font-weight: 500;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e8;
  border: 2px solid #27ae60;
  color: #1e7e34;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  letter-spacing: 0.5px;
}

.result-text {
  white-space: pre-line;
  line-height: 1.4;
}

.result-value.has-error {
  background: #fee;
  border: 2px solid #e74c3c;
  color: #c0392b;
  font-family: system-ui, sans-serif;
  font-style: normal;
}
</style>
