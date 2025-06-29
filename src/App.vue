<template>
  <main class="main-container">
    <h1>Curve Solver</h1>
    <TabContainer :tabs="tabs" :activeTab="selectedEquationType" @tab-change="handleTabChange" />
    <component
      :is="currentEquationComponent"
      :dataPoints="dataPoints"
      :result="currentResult"
      :desmosResult="currentDesmosResult"
      :equationLabel="currentEquationLabel"
      :equationTooltip="currentEquationTooltip"
      :requiredPoints="requiredPoints"
      :useFractions="useFractions"
      @update-points="updatePoints"
      @add-point="addPoint"
      @remove-point="removePoint"
      @clear-points="clearPoints"
      @toggle-fractions="toggleFractions"
      @solve-equation="solveApproximationEquation"
      @load-points="loadPoints"
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
  type SolverResult,
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
  { id: ExactEquationType.CONIC, label: 'Conic (General)\nAx² + Bxy + Cy² + Dx + Ey + F = 0' },
  {
    id: ApproximationEquationType.SINE,
    label: 'Sine\ny = a * sin(bx + c) + d',
    tooltip:
      'Advanced sine wave fitting with enhanced optimization:\n • Zero-crossing periodicity detection for frequency estimation\n • 16 phase shift attempts with least squares refinement\n • Multiple amplitude and frequency harmonic strategies\n • 200 Levenberg-Marquardt iterations with 1e-9 tolerance\n • Early termination on excellent fits (R² > 99.9%)',
  },
  {
    id: ApproximationEquationType.LOG,
    label: 'Logarithmic\ny = a * ln(bx + c) + d',
    tooltip:
      'Enhanced logarithmic fitting with dual-strategy optimization:\n • Initial log-linear regression for smart parameter estimation\n • Multiple scaling, offset, and domain validation strategies\n • Robust handling of domain constraints (ensures bx + c > 0)\n • 180 Levenberg-Marquardt iterations with 1e-9 tolerance\n • Adaptive damping and fallback mechanisms for stability',
  },
  {
    id: ApproximationEquationType.EXPONENTIAL,
    label: 'Exponential\ny = a * e^(bx + c) + d',
    tooltip:
      'Sophisticated exponential fitting with multi-strategy approach:\n • Strategy 1: Log-linear regression for positive y-values\n • Strategy 2: Intelligent offset estimation for complex patterns\n • Growth vs decay pattern recognition and parameter prioritization\n • 160 Levenberg-Marquardt iterations with enhanced stability (1e-9 tolerance)\n • Numerical overflow protection and robust fallback mechanisms',
  },
  {
    id: ApproximationEquationType.ELLIPSE,
    label: 'Ellipse (Axis-aligned)\n(x-h)²/a² + (y-k)²/b² = 1',
    tooltip:
      'Axis-aligned ellipse fitting using advanced optimization:\n Multi-strategy initialization (bounding box, moments, heuristics)\n Levenberg-Marquardt optimization with 300+ iterations\n Direct 4-parameter fitting: (x-h)²/a² + (y-k)²/b² = 1\n Mathematical correctness with robust constraint handling\n Minimum 4 points required, handles noisy and irregular data',
  },
];

const requiredPointsMap: Record<EquationType, number> = {
  [ExactEquationType.LINEAR]: 2,
  [ExactEquationType.QUADRATIC]: 3,
  [ExactEquationType.CUBIC]: 4,
  [ExactEquationType.CIRCLE]: 3,
  [ExactEquationType.CONIC]: 5,
  [ApproximationEquationType.SINE]: 3,
  [ApproximationEquationType.LOG]: 3,
  [ApproximationEquationType.EXPONENTIAL]: 3,
  [ApproximationEquationType.ELLIPSE]: 4,
};

const dataPoints = ref<DataPoint[]>([]);
const selectedEquationType = ref<EquationType>(ExactEquationType.LINEAR);
const useFractions = ref<boolean>(false);
const approximationResult = ref<SolverResult | null>(null);

const isExactEquation = computed(() =>
  Object.values(ExactEquationType).includes(selectedEquationType.value as ExactEquationType)
);
const currentEquationComponent = computed(() =>
  isExactEquation.value ? ExactEquation : ApproximationEquation
);
const currentResult = computed(() => {
  if (isExactEquation.value) {
    const result = solveEquation(selectedEquationType.value, dataPoints.value, useFractions.value);
    if (result.error) {
      return `Error: ${result.error}`;
    }
    return result.equation || '';
  } else {
    if (!approximationResult.value) {
      const minPoints = requiredPoints.value;
      return dataPoints.value.length >= minPoints
        ? `Add points and click "Solve Equation" to get the result`
        : `Add at least ${minPoints} points to solve equation`;
    }

    const result = approximationResult.value;
    if (result.error) {
      return `Error: ${result.error}`;
    }

    let displayResult = result.equation || '';
    if (result.rSquared !== undefined) {
      const rSquaredPercent = (result.rSquared * 100).toFixed(1);
      displayResult += `\nR² = ${rSquaredPercent}%`;
    }
    return displayResult;
  }
});

const currentDesmosResult = computed(() => {
  if (isExactEquation.value) {
    const result = solveEquation(selectedEquationType.value, dataPoints.value, useFractions.value);
    return result.desmosEquation || '';
  } else {
    if (!approximationResult.value) {
      return '';
    }
    return approximationResult.value.desmosEquation || '';
  }
});

const currentEquationLabel = computed(
  () => tabs.find(tab => tab.id === selectedEquationType.value)?.label || ''
);
const currentEquationTooltip = computed(
  () => tabs.find(tab => tab.id === selectedEquationType.value)?.tooltip || ''
);
const requiredPoints = computed(() => requiredPointsMap[selectedEquationType.value]);

function updatePoints(points: DataPoint[]): void {
  dataPoints.value = [...points];
}

function addPoint(x: number, y: number): void {
  if (isExactEquation.value) {
    return;
  } else {
    dataPoints.value.push({ x, y });
    approximationResult.value = null;
  }
}

function removePoint(index: number): void {
  if (!isExactEquation.value) {
    dataPoints.value.splice(index, 1);
    approximationResult.value = null;
  }
}

function handleTabChange(tabId: string): void {
  selectedEquationType.value = tabId as EquationType;
  clearPoints();
}

function solveApproximationEquation(): void {
  if (isExactEquation.value) return;

  const result = solveEquation(selectedEquationType.value, dataPoints.value, useFractions.value);
  approximationResult.value = result;
}

function clearPoints(): void {
  dataPoints.value = [];
  approximationResult.value = null;
}

function toggleFractions(): void {
  useFractions.value = !useFractions.value;
  if (!isExactEquation.value && approximationResult.value) {
    solveApproximationEquation();
  }
}

function loadPoints(points: DataPoint[]): void {
  if (isExactEquation.value) {
    const maxPoints = requiredPoints.value;
    dataPoints.value = points.slice(0, maxPoints);
  } else {
    dataPoints.value = [...points];
    approximationResult.value = null;
  }
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
