<script lang="ts" setup>
import {reactiveOmit} from '@vueuse/core';
import type {HTMLAttributes} from 'vue';
import type {AlertDialogCancelProps} from 'reka-ui';
import {AlertDialogCancel as AlertDialogCancelPrimitive} from 'reka-ui';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';

const props = defineProps<AlertDialogCancelProps & {class?: HTMLAttributes['class']}>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogCancelPrimitive
      v-bind="delegatedProps"
      :class="cn(buttonVariants({variant: 'outline'}), props.class)"
  >
    <slot/>
  </AlertDialogCancelPrimitive>
</template>