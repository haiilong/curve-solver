<template>
  <div class="button-container">
    <div class="toggle-container">
      <span class="toggle-label">Fractions</span>
      <label class="toggle-switch">
        <input type="checkbox" :checked="useFractions" @change="$emit('toggle-fractions')" />
        <span class="slider"></span>
      </label>
    </div>
    <div class="action-buttons">
      <button @click="copyPoints" class="action-button" :disabled="dataPoints.length === 0">
        Copy Points
      </button>
      <button @click="showLoadDialog" class="action-button">Load Points</button>
      <button @click="$emit('clear-points')" class="action-button">Clear Points</button>
    </div>
  </div>

  <!-- Toast notification for copy feedback -->
  <div v-if="showCopyToast" class="toast-notification">
    <div class="toast-content">
      <div class="toast-header">
        <strong>📋 Points Copied!</strong>
      </div>
      <div class="toast-body">
        {{ copyToastMessage }}
      </div>
    </div>
  </div>

  <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
    <div class="dialog-content" @click.stop>
      <h3>Load Points</h3>
      <p class="dialog-instructions">
        Enter points in the format: x,y (one point per line)
        <br />Example : <br />0,1 <br />1,4
      </p>
      <textarea v-model="pointsText" class="points-textarea" placeholder="0,1&#10;1,4" rows="6"></textarea>
      <div class="dialog-buttons">
        <button @click="loadPoints" class="dialog-button load-button">Load</button>
        <button @click="closeDialog" class="dialog-button cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  useFractions: boolean;
  dataPoints: Array<{ x: number; y: number }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'toggle-fractions': [];
  'clear-points': [];
  'load-points': [points: Array<{ x: number; y: number }>];
}>();

const showDialog = ref(false);
const pointsText = ref('');
const showCopyToast = ref(false);
const copyToastMessage = ref('');

async function copyPoints() {
  if (props.dataPoints.length === 0) return;

  const pointsText = props.dataPoints.map(point => `${point.x},${point.y}`).join('\n');

  try {
    await navigator.clipboard.writeText(pointsText);
    showCopyFeedback(pointsText);
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = pointsText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopyFeedback(pointsText);
  }
}

function showCopyFeedback(copiedText: string) {
  const lines = copiedText.split('\n');
  const pointCount = lines.length;

  const preview = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  copyToastMessage.value = `${pointCount} point${pointCount === 1 ? '' : 's'} copied:\n${preview}${hasMore ? '\n...' : ''}`;
  showCopyToast.value = true;

  setTimeout(() => {
    showCopyToast.value = false;
  }, 3000);
}

function showLoadDialog() {
  showDialog.value = true;
  pointsText.value = '';
}

function closeDialog() {
  showDialog.value = false;
  pointsText.value = '';
}

function loadPoints() {
  const text = pointsText.value.trim();
  if (!text) {
    closeDialog();
    return;
  }

  const points: Array<{ x: number; y: number }> = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parts = trimmedLine.split(',');
    if (parts.length !== 2) continue;

    const x = parseFloat(parts[0].trim());
    const y = parseFloat(parts[1].trim());

    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x, y });
    }
  }

  if (points.length > 0) {
    emit('load-points', points);
  }

  closeDialog();
}
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
}

.toggle-label {
  font-weight: 500;
  color: #2c3e50;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 25px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 25px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 21px;
  width: 21px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked+.slider {
  background-color: #2196f3;
}

input:focus+.slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked+.slider:before {
  -webkit-transform: translateX(21px);
  -ms-transform: translateX(21px);
  transform: translateX(21px);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #2c3e50;
  color: white;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: #34495e;
}

.action-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.action-button:disabled:hover {
  background: #bdc3c7;
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-content h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.dialog-instructions {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 0.9em;
  line-height: 1.4;
}

.points-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  resize: vertical;
  margin-bottom: 16px;
}

.points-textarea:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.load-button {
  background: #27ae60;
  color: white;
}

.load-button:hover {
  background: #229954;
}

.cancel-button {
  background: #95a5a6;
  color: white;
}

.cancel-button:hover {
  background: #7f8c8d;
}

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  animation: slideInRight 0.3s ease-out;
}

.toast-content {
  background: #27ae60;
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  min-width: 200px;
}

.toast-header {
  font-size: 0.95em;
  margin-bottom: 8px;
}

.toast-body {
  font-size: 0.85em;
  font-family: monospace;
  line-height: 1.3;
  opacity: 0.9;
  white-space: pre-line;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
