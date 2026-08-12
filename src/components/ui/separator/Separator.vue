<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {SeparatorProps} from "reka-ui";
import {Separator} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<SeparatorProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <Separator
    v-bind="delegatedProps"
    :class="
      cn(
        'shrink-0 bg-border',
        props.orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        props.class,
      )
    "
  />
</template>
