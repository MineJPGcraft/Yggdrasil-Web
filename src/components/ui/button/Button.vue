<script lang="ts" setup>
import {Primitive} from "reka-ui";
import {cn} from "@/lib/utils";
import {buttonVariants} from ".";

const props = defineProps<{
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  class?: string
  asChild?: boolean
  as?: string
}>();
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
