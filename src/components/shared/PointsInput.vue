<template>
  <div class="points-container">
    <div class="equation-header">
      <div class="title-section">
        <h2>{{ equationLabel.split('\n')[0] }}</h2>
        <div v-if="equationTooltip" class="tooltip-container">
          <button
            class="help-button"
            @click="showTooltip = !showTooltip"
            @blur="handleBlur"
            ref="helpButtonRef"
          >
            ?
          </button>
          <div
            v-if="showTooltip"
            class="tooltip-popup"
            @mouseenter="keepTooltipOpen = true"
            @mouseleave="handleTooltipMouseLeave"
          >
            <div class="tooltip-content">
              <h3>Algorithm Details</h3>
              <div class="tooltip-text">
                <div v-for="line in equationTooltip.split('\n')" :key="line" class="tooltip-line">
                  {{ line }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="points-info">
        <span v-if="isFixedPoints">Required points: {{ requiredPoints }}</span>
        <span v-else>Points: {{ dataPoints.length }}</span>
      </div>
    </div>

    <div class="points-list">
      <template v-if="isFixedPoints">
        <div v-for="i in requiredPoints" :key="i" class="point-item">
          <span class="point-label">Point {{ i }}:</span>
          <div class="point-inputs">
            <input
              v-model="inputPoints[i - 1].x"
              type="number"
              step="any"
              placeholder="x"
              @input="updatePoints"
            />
            <input
              v-model="inputPoints[i - 1].y"
              type="number"
              step="any"
              placeholder="y"
              @input="updatePoints"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="(point, index) in dataPoints" :key="index" class="point-item">
          <div class="point-header">
            <span class="point-label">Point {{ index + 1 }}:</span>
            <button
              @click="$emit('remove-point', index)"
              class="remove-button"
              title="Remove point"
            >
              ×
            </button>
          </div>
          <div class="point-display">
            <span class="point-coords"
              >({{ formatCoordinate(point?.x || 0) }}, {{ formatCoordinate(point?.y || 0) }})</span
            >
          </div>
        </div>

        <div class="point-item add-point">
          <div class="point-header">
            <span class="point-label">New Point:</span>
            <button @click="addPoint" class="add-button">Add</button>
          </div>
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
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { DataPoint } from '../../solvers.ts';

interface Props {
  dataPoints: DataPoint[];
  equationLabel: string;
  equationTooltip?: string;
  requiredPoints?: number;
  isFixedPoints?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  requiredPoints: 0,
  isFixedPoints: false,
});

const emit = defineEmits<{
  'update-points': [points: DataPoint[]];
  'add-point': [x: number, y: number];
  'remove-point': [index: number];
  'solve-equation': [];
}>();

const inputPoints = ref<Array<{ x: string; y: string }>>(
  Array(props.requiredPoints || 0)
    .fill(null)
    .map(() => ({ x: '', y: '' }))
);

const newPoint = ref({ x: '', y: '' });
const isUpdating = ref(false);
const showTooltip = ref(false);
const keepTooltipOpen = ref(false);
const helpButtonRef = ref<HTMLButtonElement>();
watch(
  () => props.dataPoints,
  newPoints => {
    if (props.isFixedPoints && !isUpdating.value) {
      inputPoints.value = Array(props.requiredPoints)
        .fill(null)
        .map((_, i) => ({
          x: newPoints[i]?.x.toString() || '',
          y: newPoints[i]?.y.toString() || '',
        }));
    }
  },
  { immediate: true }
);

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

  emit('add-point', x, y);
  newPoint.value = { x: '', y: '' };
}

function formatCoordinate(value: number): string {
  if (Math.abs(value - Math.round(value)) < 0.0001) {
    return Math.round(value).toString();
  }

  const formatted = parseFloat(value.toFixed(3)).toString();
  return formatted;
}

function handleBlur() {
  setTimeout(() => {
    if (!keepTooltipOpen.value) {
      showTooltip.value = false;
    }
  }, 150);
}

function handleTooltipMouseLeave() {
  keepTooltipOpen.value = false;
  showTooltip.value = false;
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

.title-section {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.equation-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.help-button {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.help-button:hover {
  background: #2980b9;
  transform: scale(1.1);
}

.tooltip-popup {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 2px solid #3498db;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 480px;
  max-width: 650px;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.tooltip-content {
  padding: 16px 20px;
}

.tooltip-content h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1em;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.tooltip-text {
  color: #2c3e50;
  font-size: 0.9em;
  line-height: 1.4;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.tooltip-line {
  margin-bottom: 6px;
}

.tooltip-line:first-child {
  font-weight: 600;
  color: #e74c3c;
  margin-bottom: 8px;
}

.tooltip-line:not(:first-child):before {
  content: '• ';
  color: #3498db;
  font-weight: bold;
  margin-right: 6px;
}

.points-info {
  color: #666;
  font-size: 0.9em;
}

.points-list {
  display: grid;
  gap: 18px;
}

.points-list:has(.point-item:not(.add-point)) {
  grid-template-columns: repeat(auto-fit, 170px);
  justify-content: start;
}

.points-list:has(.add-point) {
  grid-template-columns: repeat(auto-fit, minmax(170px, 200px));
  justify-content: start;
}
.point-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 170px;
  border: 2px solid #e9ecef;
  transition: border-color 0.2s ease;
}

.point-item:hover {
  border-color: #3498db;
}

.point-item.add-point {
  background: #e9ecef;
  border-style: dashed;
}

.point-item.add-point:hover {
  background: #f0f7ff;
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.point-label {
  font-weight: 600;
  color: #2c3e50;
}

.point-display {
  width: 100%;
  text-align: center;
}

.point-coords {
  font-family: 'Courier New', monospace;
  color: #2c3e50;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  display: inline-block;
  font-weight: 500;
}

.point-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.point-inputs input {
  width: 70px;
  padding: 8px 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.9em;
  transition: border-color 0.2s ease;
}

.point-inputs input:focus {
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
  font-size: 0.8em;
  line-height: 1.2;
  transition: background-color 0.2s ease;
}

.add-button:hover {
  background: #34495e;
}

.remove-button {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.8em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.remove-button:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .points-list:has(.point-item:not(.add-point)),
  .points-list:has(.add-point) {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    justify-content: stretch;
  }
}
</style>
