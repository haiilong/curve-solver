<template>
  <EquationSolver
    :dataPoints="dataPoints"
    :result="result"
    :equationLabel="equationLabel"
    :requiredPoints="requiredPoints"
    :useFractions="useFractions"
    :isExactEquation="false"
    @update-points="$emit('update-points', $event)"
    @add-point="$emit('add-point')"
    @remove-point="$emit('remove-point', $event)"
    @clear-points="$emit('clear-points')"
    @toggle-fractions="$emit('toggle-fractions')"
  />
</template>

<script setup lang="ts">
import type { DataPoint } from '../solvers.ts';
import EquationSolver from './EquationSolver.vue';

interface Props {
  dataPoints: DataPoint[];
  result: string;
  equationLabel: string;
  requiredPoints: number;
  useFractions: boolean;
}

defineProps<Props>();

defineEmits<{
  'update-points': [points: DataPoint[]];
  'add-point': [];
  'remove-point': [index: number];
  'clear-points': [];
  'toggle-fractions': [];
}>();
</script>

 