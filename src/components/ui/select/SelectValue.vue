<script lang="ts" setup>
import type {SelectValueProps} from "reka-ui";
import {SelectValue} from "reka-ui";

const props = defineProps<SelectValueProps & { placeholder?: string }>();
</script>

<template>
  <SelectValue v-bind="props">
    <slot />
  </SelectValue>
</template>
