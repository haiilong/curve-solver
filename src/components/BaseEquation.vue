<template>
  <div class="base-equation">
    <section class="controls-section">
      <button @click="$emit('load-sample-data')" class="sample-btn">
        Load Sample Data for {{ equationLabel }}
      </button>

      <div class="input-group">
        <h2>Add Data Points</h2>
        <div class="input-controls">
          <input v-model="newX" type="number" placeholder="X value" step="any" />
          <input v-model="newY" type="number" placeholder="Y value" step="any" />
          <button @click="addPoint">Add Point</button>
          <button @click="$emit('clear-points')" class="clear-btn">Clear All</button>
        </div>
      </div>
    </section>

    <section class="data-section">
      <h2>Data Points ({{ dataPoints.length }})</h2>
      <p v-if="dataPoints.length === 0" class="empty-message">
        No data points. Add some points or load sample data.
      </p>
      <div v-else class="points-grid">
        <div v-for="(point, i) in dataPoints" :key="i" class="point-card">
          <span>({{ point.x }}, {{ point.y }})</span>
          <button class="remove-btn" @click="$emit('remove-point', i)">×</button>
        </div>
      </div>
    </section>

    <section class="results-section">
      <h2>Solution</h2>
      <div v-if="result?.error" class="error">
        <strong>Error:</strong> {{ result.error }} <br /><small
          >Need at least {{ minPoints }} points for {{ equationLabel }} regression.</small
        >
      </div>
      <template v-else-if="result?.equation">
        <div class="equation">
          <strong>{{ result.equation }}</strong>
        </div>
        <div v-if="result.rSquared !== undefined" class="r-squared">
          <strong>R² = {{ result.rSquared.toFixed(6) }}</strong>
          <small>(coefficient of determination)</small>
        </div>
      </template>
      <p v-else class="empty-message">Add data points to see the solution.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type DataPoint, type SolverResult } from '../solvers.js';

interface Props {
  dataPoints: DataPoint[];
  result: SolverResult | null;
  equationLabel: string;
  minPoints: number;
}

defineProps<Props>();

const newX = ref('');
const newY = ref('');

const emit = defineEmits<{
  'add-point': [x: number, y: number];
  'remove-point': [index: number];
  'clear-points': [];
  'load-sample-data': [];
}>();

function addPoint(): void {
  if (newX.value !== '' && newY.value !== '') {
    const x = parseFloat(newX.value);
    const y = parseFloat(newY.value);
    if (!isNaN(x) && !isNaN(y)) {
      emit('add-point', x, y);
      newX.value = '';
      newY.value = '';
    }
  }
}
</script>

<style scoped>
.base-equation {
  max-width: 1200px;
  margin: 0 auto;
}

section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.controls-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
}

.sample-btn {
  background: #27ae60;
  font-size: 14px;
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.sample-btn:hover {
  background: #229954;
}

.input-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

input {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  flex: 1;
  min-width: 120px;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

button {
  padding: 12px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

button:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.clear-btn {
  background: #e74c3c;
}

.clear-btn:hover {
  background: #c0392b;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.point-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.remove-btn:hover {
  background: #c0392b;
}

.equation {
  font-size: 1.5em;
  text-align: center;
  padding: 20px;
  background: #e8f4f8;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  margin: 15px 0;
}

.error {
  font-size: 1.2em;
  text-align: center;
  padding: 20px;
  background: #fdf2f2;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
  margin: 15px 0;
  color: #721c24;
}

.r-squared {
  text-align: center;
  padding: 15px;
  background: #d4edda;
  border-radius: 8px;
  margin: 15px 0;
  color: #155724;
}

.empty-message {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

@media (max-width: 768px) {
  .input-controls {
    flex-direction: column;
  }
}
</style>
