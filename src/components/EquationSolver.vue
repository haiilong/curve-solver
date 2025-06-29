<template>
  <div class="equation-container">
    <PointsInput
      :dataPoints="dataPoints"
      :equationLabel="equationLabel"
      :equationTooltip="equationTooltip"
      :requiredPoints="requiredPoints"
      :isFixedPoints="isExactEquation"
      @update-points="$emit('update-points', $event)"
      @add-point="(x: number, y: number) => $emit('add-point', x, y)"
      @remove-point="$emit('remove-point', $event)"
      @solve-equation="$emit('solve-equation')"
    />

    <EquationControls
      :useFractions="useFractions"
      :dataPoints="dataPoints"
      :equation="result"
      :desmosEquation="desmosResult"
      @toggle-fractions="$emit('toggle-fractions')"
      @clear-points="$emit('clear-points')"
      @load-points="$emit('load-points', $event)"
    />

    <ResultDisplay
      :result="result"
      :fallbackMessage="
        isExactEquation
          ? `Add ${requiredPoints} points to solve equation`
          : `Add at least ${requiredPoints} points to solve equation`
      "
    />

    <div v-if="!isExactEquation && dataPoints.length >= requiredPoints" class="solve-section">
      <button @click="$emit('solve-equation')" class="solve-button">
        <span>Solve Equation</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DataPoint } from '../solvers.ts';
import PointsInput from './shared/PointsInput.vue';
import EquationControls from './shared/EquationControls.vue';
import ResultDisplay from './shared/ResultDisplay.vue';

interface Props {
  dataPoints: DataPoint[];
  result: string;
  equationLabel: string;
  equationTooltip?: string;
  requiredPoints: number;
  useFractions: boolean;
  isExactEquation?: boolean;
  desmosResult: string;
}

withDefaults(defineProps<Props>(), {
  isExactEquation: false,
});

defineEmits<{
  'update-points': [points: DataPoint[]];
  'add-point': [x: number, y: number];
  'remove-point': [index: number];
  'solve-equation': [];
  'toggle-fractions': [];
  'clear-points': [];
  'load-points': [points: DataPoint[]];
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

.solve-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.solve-button {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(39, 174, 96, 0.3);
}

.solve-button:hover {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(39, 174, 96, 0.4);
}

.solve-button:active {
  transform: translateY(0);
}
</style>
