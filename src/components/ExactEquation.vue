<template>
  <EquationSolver
    :dataPoints="dataPoints"
    :result="result"
    :equationLabel="equationLabel"
    :equationTooltip="equationTooltip"
    :requiredPoints="requiredPoints"
    :useFractions="useFractions"
    :isExactEquation="true"
    :desmosResult="desmosResult"
    @update-points="$emit('update-points', $event)"
    @clear-points="$emit('clear-points')"
    @toggle-fractions="$emit('toggle-fractions')"
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
  equationTooltip?: string;
  requiredPoints: number;
  useFractions: boolean;
  desmosResult: string;
}

defineProps<Props>();

defineEmits<{
  'update-points': [points: DataPoint[]];
  'clear-points': [];
  'toggle-fractions': [];
  'load-points': [points: DataPoint[]];
}>();
</script>
