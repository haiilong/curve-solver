<template>
  <div class="button-container">
    <div class="toggle-container">
      <span class="toggle-label">Fractions</span>
      <label class="toggle-switch">
        <input 
          type="checkbox" 
          :checked="useFractions" 
          @change="$emit('toggle-fractions')"
        >
        <span class="slider"></span>
      </label>
    </div>
    <button @click="$emit('clear-points')" class="action-button">Clear Points</button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  useFractions: boolean;
}

defineProps<Props>();

defineEmits<{
  'toggle-fractions': [];
  'clear-points': [];
}>();
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
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 25px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 21px;
  width: 21px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(21px);
  -ms-transform: translateX(21px);
  transform: translateX(21px);
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
</style> 