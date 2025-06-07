<template>
  <EquationSolver
    :dataPoints="dataPoints"
    :result="result"
    :equationLabel="equationLabel"
    :requiredPoints="requiredPoints"
    :useFractions="useFractions"
    :isExactEquation="true"
    @update-points="$emit('update-points', $event)"
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
  'clear-points': [];
  'toggle-fractions': [];
}>();
</script>

 