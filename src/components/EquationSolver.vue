<template>
  <div class="equation-container">
    <PointsInput
      :dataPoints="dataPoints"
      :equationLabel="equationLabel"
      :requiredPoints="requiredPoints"
      :isFixedPoints="isExactEquation"
      @update-points="$emit('update-points', $event)"
      @add-point="$emit('add-point')"
      @remove-point="$emit('remove-point', $event)"
    />
    
    <EquationControls
      :useFractions="useFractions"
      @toggle-fractions="$emit('toggle-fractions')"
      @clear-points="$emit('clear-points')"
    />
    
    <ResultDisplay
      :result="result"
      :fallbackMessage="isExactEquation ? 
        `Add ${requiredPoints} points to solve equation` : 
        `Add at least ${requiredPoints} points to solve equation`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DataPoint } from '../solvers.ts';
import PointsInput from './shared/PointsInput.vue';
import EquationControls from './shared/EquationControls.vue';
import ResultDisplay from './shared/ResultDisplay.vue';

interface Props {
  dataPoints: DataPoint[];
  result: string;
  equationLabel: string;
  requiredPoints: number;
  useFractions: boolean;
  isExactEquation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isExactEquation: false
});

defineEmits<{
  'update-points': [points: DataPoint[]];
  'add-point': [];
  'remove-point': [index: number];
  'clear-points': [];
  'toggle-fractions': [];
}>();
</script>

<style scoped>
.equation-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}
</style> 