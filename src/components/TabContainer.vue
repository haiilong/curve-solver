<template>
  <section class="tabs-section">
    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          type="button"
          @click="$emit('tab-change', tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
}

defineProps<Props>();

defineEmits<{
  'tab-change': [tabId: string];
}>();
</script>

<style scoped>
.tabs-section {
  margin-bottom: 20px;
}

.tabs-container {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #ddd;
}

.tabs {
  display: flex;
  gap: 10px;
}

.tab {
  padding: 12px 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
  text-align: center;
  color: #495057;
}

.tab:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.tab.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

@media (max-width: 768px) {
  .tabs {
    flex-wrap: wrap;
    gap: 5px;
  }

  .tab {
    font-size: 12px;
    padding: 8px 12px;
    flex: 1 1 calc(50% - 2.5px);
    min-width: calc(50% - 2.5px);
  }
}

@media (max-width: 480px) {
  .tab {
    flex: 1 1 100%;
    min-width: 100%;
  }
}
</style>
