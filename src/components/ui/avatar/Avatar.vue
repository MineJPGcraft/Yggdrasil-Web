<script lang="ts" setup>
import type {AvatarRootProps} from "reka-ui";
import {AvatarRoot} from "reka-ui";
import {cn} from "@/lib/utils";
import {avatarVariant} from ".";

interface AvatarProps extends AvatarRootProps {
  class?: string;
  size?: "sm" | "base" | "lg";
  shape?: "circle" | "square";
}

const props = defineProps<AvatarProps>();
</script>

<template>
  <AvatarRoot :class="cn(avatarVariant({ size, shape }), props.class)">
    <slot />
  </AvatarRoot>
</template>
