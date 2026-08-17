<script lang="ts" setup>
import {reactiveOmit} from '@vueuse/core';
import type {HTMLAttributes} from 'vue';
import type {AlertDialogTitleProps} from 'reka-ui';
import {AlertDialogTitle as AlertDialogTitlePrimitive} from 'reka-ui';
import {cn} from '@/lib/utils';

const props = defineProps<AlertDialogTitleProps & {class?: HTMLAttributes['class']}>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogTitlePrimitive
      v-bind="delegatedProps"
      :class="cn('text-lg font-semibold', props.class)"
  >
    <slot/>
  </AlertDialogTitlePrimitive>
</template>