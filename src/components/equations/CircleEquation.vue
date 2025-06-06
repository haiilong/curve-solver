<template>
  <BaseEquation
    :dataPoints="dataPoints"
    :result="result"
    @add-point="(x, y) => $emit('add-point', x, y)"
    @remove-point="index => $emit('remove-point', index)"
    @clear-points="$emit('clear-points')"
    @load-sample-data="$emit('load-sample-data')"
    equationLabel="Circle"
    :minPoints="3"

  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type DataPoint, solveEquation } from '../../solvers.js';
import BaseEquation from '../BaseEquation.vue';

interface Props {
  dataPoints: DataPoint[];
}

const props = defineProps<Props>();

defineEmits<{
  'add-point': [x: number, y: number];
  'remove-point': [index: number];
  'clear-points': [];
  'load-sample-data': [];
}>();

const result = computed(() => {
  if (props.dataPoints.length === 0) return null;
  return solveEquation('circle', props.dataPoints);
});


</script>
