<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {SelectSeparatorProps} from "reka-ui";
import {SelectSeparator} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<SelectSeparatorProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <SelectSeparator
    v-bind="delegatedProps"
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
  />
</template>
