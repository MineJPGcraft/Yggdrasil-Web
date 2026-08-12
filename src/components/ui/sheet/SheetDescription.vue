<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {DialogDescriptionProps} from "reka-ui";
import {DialogDescription} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<DialogDescriptionProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <DialogDescription
    :class="cn('text-sm text-muted-foreground', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogDescription>
</template>
