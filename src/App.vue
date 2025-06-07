<template>
  <main class="main-container">
    <h1>Curve Solver</h1>
    <TabContainer :tabs="tabs" :activeTab="selectedEquationType" @tab-change="handleTabChange" />
    <component
      :is="currentEquationComponent"
      :dataPoints="dataPoints"
      :result="currentResult"
      :equationLabel="currentEquationLabel"
      :requiredPoints="requiredPoints"
      :useFractions="useFractions"
      @update-points="updatePoints"
      @add-point="addPoint"
      @remove-point="removePoint"
      @clear-points="clearPoints"
      @toggle-fractions="toggleFractions"
      @load-sample-data="loadSampleData"
    />
  </main>
</template>

<script setup lang="ts">
import TabContainer from './components/TabContainer.vue';
import ExactEquation from './components/ExactEquation.vue';
import ApproximationEquation from './components/ApproximationEquation.vue';
import {
  type DataPoint,
  type EquationType,
  ExactEquationType,
  ApproximationEquationType,
  solveEquation,
} from './solvers.ts';
import { ref, computed } from 'vue';

const tabs = [
  { id: ExactEquationType.LINEAR, label: 'Linear\ny = ax + b' },
  { id: ExactEquationType.QUADRATIC, label: 'Quadratic\ny = ax² + bx + c' },
  { id: ExactEquationType.CUBIC, label: 'Cubic\ny = ax³ + bx² + cx + d' },
  { id: ExactEquationType.CIRCLE, label: 'Circle\n(x-h)² + (y-k)² = r²' },
  { id: ExactEquationType.ELLIPSE, label: 'Ellipse\n(x-h)²/a² + (y-k)²/b² = 1' },
  { id: ApproximationEquationType.SINE, label: 'Sine\ny = a * sin(bx + c) + d' },
  { id: ApproximationEquationType.LOG, label: 'Logarithmic\ny = a * ln(bx + c) + d' },
  { id: ApproximationEquationType.EXPONENTIAL, label: 'Exponential\ny = a * e^(bx + c) + d' },
];

const sampleDataSets: Record<EquationType, DataPoint[]> = {
  [ExactEquationType.LINEAR]: [
    { x: 0, y: 1 },
    { x: 1, y: 3 },
  ],
  [ExactEquationType.QUADRATIC]: [
    { x: -2, y: 4 },
    { x: -1, y: 1 },
    { x: 0, y: 0 },
  ],
  [ExactEquationType.CUBIC]: [
    { x: -2, y: -8 },
    { x: -1, y: -1 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  [ExactEquationType.CIRCLE]: [
    { x: 0, y: 2 },
    { x: 2, y: 0 },
    { x: 0, y: -2 },
  ],
  [ExactEquationType.ELLIPSE]: [
    { x: 0, y: 3 },
    { x: 2, y: 0 },
    { x: 0, y: -3 },
    { x: -2, y: 0 },
  ],
  [ApproximationEquationType.SINE]: [
    { x: 0, y: 0 },
    { x: Math.PI / 2, y: 1 },
    { x: Math.PI, y: 0 },
    { x: (3 * Math.PI) / 2, y: -1 },
  ],
  [ApproximationEquationType.LOG]: [
    { x: 1, y: 0 },
    { x: 2, y: 0.693 },
    { x: 3, y: 1.099 },
    { x: 4, y: 1.386 },
  ],
  [ApproximationEquationType.EXPONENTIAL]: [
    { x: 0, y: 1 },
    { x: 1, y: 2.718 },
    { x: 2, y: 7.389 },
    { x: 3, y: 20.086 },
  ],
};

const requiredPointsMap: Record<EquationType, number> = {
  [ExactEquationType.LINEAR]: 2,
  [ExactEquationType.QUADRATIC]: 3,
  [ExactEquationType.CUBIC]: 4,
  [ExactEquationType.CIRCLE]: 3,
  [ExactEquationType.ELLIPSE]: 4,
  [ApproximationEquationType.SINE]: 4,
  [ApproximationEquationType.LOG]: 3,
  [ApproximationEquationType.EXPONENTIAL]: 3,
};

const dataPoints = ref<DataPoint[]>([]);
const selectedEquationType = ref<EquationType>(ExactEquationType.LINEAR);
const useFractions = ref<boolean>(false);

const isExactEquation = computed(() =>
  Object.values(ExactEquationType).includes(selectedEquationType.value as ExactEquationType)
);
const currentEquationComponent = computed(() =>
  isExactEquation.value ? ExactEquation : ApproximationEquation
);
const currentResult = computed(() => {
  const result = solveEquation(selectedEquationType.value, dataPoints.value, useFractions.value);
  if (result.error) {
    return `Error: ${result.error}`;
  }
  return result.equation || '';
});
const currentEquationLabel = computed(
  () => tabs.find(tab => tab.id === selectedEquationType.value)?.label || ''
);
const requiredPoints = computed(() => requiredPointsMap[selectedEquationType.value]);

function updatePoints(points: DataPoint[]): void {
  dataPoints.value = [...points];
}

function addPoint(x: number, y: number): void {
  if (isExactEquation.value) {
    const index = dataPoints.value.length;
    if (index < requiredPoints.value) {
      dataPoints.value[index] = { x, y };
    }
  } else {
    dataPoints.value.push({ x, y });
  }
}

function removePoint(index: number): void {
  if (!isExactEquation.value) {
    dataPoints.value.splice(index, 1);
  }
}

function clearPoints(): void {
  dataPoints.value = [];
}

function loadSampleData(): void {
  dataPoints.value = [...sampleDataSets[selectedEquationType.value]];
}

function handleTabChange(tabId: string): void {
  selectedEquationType.value = tabId as EquationType;
  clearPoints();
}

function toggleFractions(): void {
  useFractions.value = !useFractions.value;
}
</script>

<style scoped>
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 25px 30px 30px 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 3px solid #34495e;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.8em;
}
</style>
