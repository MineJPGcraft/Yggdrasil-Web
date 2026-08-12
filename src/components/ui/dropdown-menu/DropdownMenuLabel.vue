<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {DropdownMenuLabelProps} from "reka-ui";
import {DropdownMenuLabel, useForwardProps} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<DropdownMenuLabelProps & { class?: string; inset?: boolean }>();

const delegatedProps = reactiveOmit(props, "class", "inset");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuLabel
    v-bind="forwardedProps"
    :class="
      cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', props.class)
    "
  >
    <slot />
  </DropdownMenuLabel>
</template>
