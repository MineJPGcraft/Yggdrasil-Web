<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import {ChevronUp} from "lucide-vue-next";
import type {SelectScrollUpButtonProps} from "reka-ui";
import {SelectScrollUpButton, useForwardProps} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<SelectScrollUpButtonProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectScrollUpButton
    v-bind="forwardedProps"
    :class="
      cn('flex cursor-default items-center justify-center py-1', props.class)
    "
  >
    <slot>
      <ChevronUp />
    </slot>
  </SelectScrollUpButton>
</template>
