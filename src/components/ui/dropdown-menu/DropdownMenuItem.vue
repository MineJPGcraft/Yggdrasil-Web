<script lang="ts" setup>
import {reactiveOmit} from "@vueuse/core";
import type {DropdownMenuItemProps} from "reka-ui";
import {DropdownMenuItem, useForwardProps} from "reka-ui";
import {cn} from "@/lib/utils";

const props = defineProps<DropdownMenuItemProps & { class?: string; inset?: boolean }>();

const delegatedProps = reactiveOmit(props, "class", "inset");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm gap-2 px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
        inset && 'pl-8',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
