<script lang="ts" setup>
import type {SelectItemTextProps} from "reka-ui";
import {SelectItemText} from "reka-ui";

const props = defineProps<SelectItemTextProps>();
</script>

<template>
  <SelectItemText v-bind="props">
    <slot />
  </SelectItemText>
</template>
