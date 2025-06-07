<template>
  <div class="tab-container">
    <div class="tab-row">
      <button
        v-for="tab in exactTabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="$emit('tab-change', tab.id)"
      >
        <div class="tab-content">
          <span class="tab-type">{{ tab.label.split('\n')[0] }}</span>
          <span class="tab-equation">{{ tab.label.split('\n')[1] }}</span>
        </div>
      </button>
    </div>
    <div class="tab-row">
      <button
        v-for="tab in approximationTabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="$emit('tab-change', tab.id)"
      >
        <div class="tab-content">
          <span class="tab-type">{{ tab.label.split('\n')[0] }}</span>
          <span class="tab-equation">{{ tab.label.split('\n')[1] }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ExactEquationType, ApproximationEquationType } from '../solvers.ts';

interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
}

const props = defineProps<Props>();
defineEmits<{
  (e: 'tab-change', tabId: string): void;
}>();

const exactTabs = computed(() =>
  props.tabs.filter(tab => Object.values(ExactEquationType).includes(tab.id as ExactEquationType))
);

const approximationTabs = computed(() =>
  props.tabs.filter(tab =>
    Object.values(ApproximationEquationType).includes(tab.id as ApproximationEquationType)
  )
);
</script>

<style scoped>
.tab-container {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}

.tab-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 18px;
  margin-bottom: 0;
}

.tab-button {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 16px 28px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 170px;
  text-align: center;
  font-size: 1em;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-button:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.tab-button.active {
  background: #2c3e50;
  border-color: #2c3e50;
  color: white;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.tab-type {
  font-weight: 600;
  font-size: 1.08em;
}

.tab-equation {
  font-family: monospace;
  font-size: 0.97em;
  opacity: 0.92;
}

.tab-button.active .tab-equation {
  opacity: 1;
}

@media (max-width: 1100px) {
  .tab-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  .tab-button {
    min-width: 120px;
    padding: 12px 10px;
    font-size: 0.95em;
  }
}

@media (max-width: 700px) {
  .tab-row {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .tab-button {
    width: 100%;
    min-width: 0;
    padding: 10px 0;
    font-size: 0.93em;
  }
}
</style>
