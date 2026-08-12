<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {TabsListProps} from "reka-ui";
import {TabsList} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<TabsListProps & { class?: string }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <TabsList
    v-bind="delegatedProps"
    :class="
      cn(
        'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>
