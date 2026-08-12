<script lang="ts" setup>
import type {SelectLabelProps} from "reka-ui";
import {SelectLabel} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<SelectLabelProps & { class?: string }>();
</script>

<template>
  <SelectLabel :class="cn('px-2 py-1.5 text-sm font-semibold', props.class)">
    <slot />
  </SelectLabel>
</template>
