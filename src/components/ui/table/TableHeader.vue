<script lang="ts" setup>
import {cn} from "@/lib/utils";

const props = defineProps<{
  class?: string
}>();
</script>

<template>
  <thead :class="cn('[&_tr]:border-b', props.class)">
    <slot />
  </thead>
</template>
