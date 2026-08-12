<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {SelectGroupProps} from "reka-ui";
import {SelectGroup} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<SelectGroupProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <SelectGroup :class="cn('p-1 w-full', props.class)" v-bind="delegatedProps">
    <slot />
  </SelectGroup>
</template>
