<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {DialogTitleProps} from "reka-ui";
import {DialogTitle} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<DialogTitleProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <DialogTitle
    :class="cn('text-lg font-semibold text-foreground', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogTitle>
</template>
