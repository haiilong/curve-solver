<template>
  <EquationSolver
    :dataPoints="dataPoints"
    :result="result"
    :equationLabel="equationLabel"
    :equationTooltip="equationTooltip"
    :requiredPoints="requiredPoints"
    :useFractions="useFractions"
    :isExactEquation="false"
    :desmosResult="desmosResult"
    @update-points="$emit('update-points', $event)"
    @add-point="(x: number, y: number) => $emit('add-point', x, y)"
    @remove-point="$emit('remove-point', $event)"
    @clear-points="$emit('clear-points')"
    @toggle-fractions="$emit('toggle-fractions')"
    @solve-equation="$emit('solve-equation')"
    @load-points="$emit('load-points', $event)"
  />
</template>

<script setup lang="ts">
import type { DataPoint } from '../solvers.ts';
import EquationSolver from './EquationSolver.vue';

interface Props {
  dataPoints: DataPoint[];
  result: string;
  equationLabel: string;
  equationTooltip: string;
  requiredPoints: number;
  useFractions: boolean;
  desmosResult: string;
}

defineProps<Props>();

defineEmits<{
  'update-points': [points: DataPoint[]];
  'add-point': [x: number, y: number];
  'remove-point': [index: number];
  'clear-points': [];
  'toggle-fractions': [];
  'solve-equation': [];
  'load-points': [points: DataPoint[]];
}>();
</script>
