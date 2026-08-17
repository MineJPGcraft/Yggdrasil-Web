<script lang="ts" setup>
import {reactiveOmit} from '@vueuse/core';
import type {HTMLAttributes} from 'vue';
import type {AlertDialogActionProps} from 'reka-ui';
import {AlertDialogAction as AlertDialogActionPrimitive} from 'reka-ui';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';

const props = defineProps<AlertDialogActionProps & {class?: HTMLAttributes['class']}>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogActionPrimitive
      v-bind="delegatedProps"
      :class="cn(buttonVariants(), props.class)"
  >
    <slot/>
  </AlertDialogActionPrimitive>
</template>