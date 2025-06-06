<template>
  <main>
    <h1>{{ name }}</h1>
    <p>Advanced Curve Fitting Tool with Multiple Equation Types</p>

    <TabContainer :tabs="tabs" :activeTab="selectedEquationType" @tab-change="handleTabChange" />

    <component
      :is="currentEquationComponent"
      :dataPoints="dataPoints"
      @add-point="addPoint"
      @remove-point="removePoint"
      @clear-points="clearPoints"
      @load-sample-data="loadSampleData"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TabContainer from './components/TabContainer.vue';
import CircleEquation from './components/equations/CircleEquation.vue';
import CubicEquation from './components/equations/CubicEquation.vue';
import EllipseEquation from './components/equations/EllipseEquation.vue';
import LinearEquation from './components/equations/LinearEquation.vue';
import QuadraticEquation from './components/equations/QuadraticEquation.vue';
import { type DataPoint, type EquationType } from './solvers.js';

interface Props {
  name?: string;
}

const { name = 'Curve Solver' } = defineProps<Props>();

// Component mapping for dynamic component rendering
const equationComponents = {
  linear: LinearEquation,
  quadratic: QuadraticEquation,
  cubic: CubicEquation,
  circle: CircleEquation,
  ellipse: EllipseEquation,
} as const;

// Sample data for each equation type
const sampleDataSets: Record<EquationType, DataPoint[]> = {
  linear: [
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 5 },
    { x: 3, y: 7 },
  ],
  quadratic: [
    { x: -2, y: 4 },
    { x: -1, y: 1 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 4 },
  ],
  cubic: [
    { x: -2, y: -8 },
    { x: -1, y: -1 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 8 },
  ],
  circle: [
    { x: 0, y: 2 },
    { x: 2, y: 0 },
    { x: 0, y: -2 },
    { x: -2, y: 0 },
  ],
  ellipse: [
    { x: 0, y: 3 },
    { x: 2, y: 0 },
    { x: 0, y: -3 },
    { x: -2, y: 0 },
    { x: 1.5, y: 2.1 },
  ],
};

// Tab configuration
const tabs = [
  { id: 'linear', label: 'Linear (y = ax + b)' },
  { id: 'quadratic', label: 'Quadratic (y = ax² + bx + c)' },
  { id: 'cubic', label: 'Cubic (y = ax³ + bx² + cx + d)' },
  { id: 'circle', label: 'Circle ((x-h)² + (y-k)² = r²)' },
  { id: 'ellipse', label: 'Ellipse (axis-aligned)' },
];

// Reactive state
const dataPoints = ref<DataPoint[]>([
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 4 },
  { x: 3, y: 9 },
  { x: 4, y: 16 },
]);

const selectedEquationType = ref<EquationType>('linear');

// Computed properties
const currentEquationComponent = computed(() => equationComponents[selectedEquationType.value]);

// Event handlers
function addPoint(x: number, y: number): void {
  dataPoints.value.push({ x, y });
}

function removePoint(index: number): void {
  dataPoints.value.splice(index, 1);
}

function clearPoints(): void {
  dataPoints.value.length = 0;
}

function loadSampleData(): void {
  dataPoints.value = [...sampleDataSets[selectedEquationType.value]];
}

function handleTabChange(tabId: string): void {
  selectedEquationType.value = tabId as EquationType;
}
</script>

<style scoped>
main {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 2.5em;
}

p {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.1em;
}

@media (max-width: 768px) {
  main {
    margin: 0;
    border-radius: 0;
    padding: 20px;
  }
}
</style>
