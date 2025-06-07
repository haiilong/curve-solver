<template>
  <div class="points-container">
    <div class="equation-header">
      <h2>{{ equationLabel.split('\n')[0] }}</h2>
      <div class="points-info">
        <span v-if="isFixedPoints">Required points: {{ requiredPoints }}</span>
        <span v-else>Points: {{ dataPoints.length }}</span>
      </div>
    </div>

    <div class="points-list">
      <!-- Fixed points mode (for exact equations) -->
      <template v-if="isFixedPoints">
        <div v-for="i in requiredPoints" :key="i" class="point-item">
          <span class="point-label">Point {{ i }}:</span>
          <div class="point-inputs">
            <input
              v-model="inputPoints[i-1].x"
              type="number"
              step="any"
              placeholder="x"
              @input="updatePoints"
            />
            <input
              v-model="inputPoints[i-1].y"
              type="number"
              step="any"
              placeholder="y"
              @input="updatePoints"
            />
          </div>
        </div>
      </template>

      <!-- Dynamic points mode (for approximation equations) -->
      <template v-else>
        <div v-for="(point, index) in dataPoints" :key="index" class="point-item">
          <span class="point-label">Point {{ index + 1 }}:</span>
          <span class="point-coords">({{ point.x.toFixed(2) }}, {{ point.y.toFixed(2) }})</span>
          <button @click="$emit('remove-point', index)" class="remove-button">×</button>
        </div>
        <div class="point-item empty">
          <span class="point-label">New Point:</span>
          <div class="point-inputs">
            <input
              v-model="newPoint.x"
              type="number"
              step="any"
              placeholder="x"
              @keyup.enter="addPoint"
            />
            <input
              v-model="newPoint.y"
              type="number"
              step="any"
              placeholder="y"
              @keyup.enter="addPoint"
            />
            <button @click="addPoint" class="add-button">Add</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import type { DataPoint } from '../../solvers.ts';

interface Props {
  dataPoints: DataPoint[];
  equationLabel: string;
  requiredPoints?: number;
  isFixedPoints?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  requiredPoints: 0,
  isFixedPoints: false
});

const emit = defineEmits<{
  'update-points': [points: DataPoint[]];
  'add-point': [];
  'remove-point': [index: number];
}>();

const inputPoints = ref<Array<{ x: string; y: string }>>(
  Array(props.requiredPoints || 0).fill(null).map(() => ({ x: '', y: '' }))
);

const newPoint = ref({ x: '', y: '' });
const isUpdating = ref(false);

// Watch for external dataPoints changes (for fixed points mode)
watch(() => props.dataPoints, (newPoints) => {
  if (props.isFixedPoints && !isUpdating.value) {
    inputPoints.value = Array(props.requiredPoints).fill(null).map((_, i) => ({
      x: newPoints[i]?.x.toString() || '',
      y: newPoints[i]?.y.toString() || ''
    }));
  }
}, { immediate: true });

let updateTimeout: number | null = null;

function updatePoints() {
  if (!props.isFixedPoints) return;
  
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = setTimeout(() => {
    isUpdating.value = true;
    
    const validPoints: DataPoint[] = [];
    
    for (let i = 0; i < inputPoints.value.length; i++) {
      const x = parseFloat(inputPoints.value[i].x);
      const y = parseFloat(inputPoints.value[i].y);
      
      if (!isNaN(x) && !isNaN(y)) {
        validPoints.push({ x, y });
      }
    }
    
    emit('update-points', validPoints);
    
    nextTick(() => {
      isUpdating.value = false;
    });
  }, 150);
}

function addPoint() {
  if (props.isFixedPoints) return;
  
  const x = parseFloat(newPoint.value.x);
  const y = parseFloat(newPoint.value.y);

  if (isNaN(x) || isNaN(y)) {
    return;
  }

  emit('add-point');
  newPoint.value = { x: '', y: '' };
}
</script>

<style scoped>
.points-container {
  margin-bottom: 12px;
}

.equation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.equation-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.points-info {
  color: #666;
  font-size: 0.9em;
}

.points-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

.point-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 170px;
}

.point-item.empty {
  background: #e9ecef;
  color: #666;
}

.point-label {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
}

.point-coords {
  font-family: monospace;
  color: #666;
}

.point-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.add-button {
  padding: 4px 8px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.add-button:hover {
  background: #34495e;
}

.remove-button {
  padding: 2px 6px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  line-height: 1;
}

.remove-button:hover {
  background: #c0392b;
}

@media (max-width: 1100px) {
  .points-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .points-list {
    grid-template-columns: 1fr;
  }
  .point-item {
    min-width: 0;
  }
}
</style> 