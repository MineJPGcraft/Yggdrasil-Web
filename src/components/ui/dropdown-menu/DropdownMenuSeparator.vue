<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {DropdownMenuSeparatorProps} from "reka-ui";
import {DropdownMenuSeparator} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<DropdownMenuSeparatorProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <DropdownMenuSeparator
    v-bind="delegatedProps"
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
  />
</template>
