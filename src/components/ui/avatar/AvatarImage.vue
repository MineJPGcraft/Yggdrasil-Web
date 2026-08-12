<script lang="ts" setup>
import type {AvatarImageProps} from "reka-ui";
import {AvatarImage} from "reka-ui";

const props = defineProps<AvatarImageProps & { class?: string }>();
</script>

<template>
  <AvatarImage v-bind="props" class="h-full w-full object-cover">
    <slot />
  </AvatarImage>
</template>
