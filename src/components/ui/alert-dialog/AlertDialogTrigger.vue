<script lang="ts" setup>
import {reactiveOmit} from '@vueuse/core';
import type {HTMLAttributes} from 'vue';
import type {AlertDialogTriggerProps} from 'reka-ui';
import {AlertDialogTrigger as AlertDialogPrimitiveTrigger} from 'reka-ui';
import {cn} from '@/lib/utils';

const props = defineProps<AlertDialogTriggerProps & {class?: HTMLAttributes['class']}>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogPrimitiveTrigger v-bind="delegatedProps" :class="cn(props.class)">
    <slot/>
  </AlertDialogPrimitiveTrigger>
</template>