<script lang="ts" setup>
import {reactiveOmit} from '@vueuse/core';
import type {HTMLAttributes} from 'vue';
import type {AlertDialogDescriptionProps} from 'reka-ui';
import {AlertDialogDescription as AlertDialogDescriptionPrimitive} from 'reka-ui';
import {cn} from '@/lib/utils';

const props = defineProps<AlertDialogDescriptionProps & {class?: HTMLAttributes['class']}>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogDescriptionPrimitive
      v-bind="delegatedProps"
      :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot/>
  </AlertDialogDescriptionPrimitive>
</template>