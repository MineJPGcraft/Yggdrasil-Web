<script setup>
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mode = useColorMode()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <svg class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1v2" />
            <path d="M12 21v2" />
            <path d="m4.22 4.22 1.42 1.42" />
            <path d="m18.36 18.36 1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="m4.22 19.78 1.42-1.42" />
            <path d="m18.36 5.64 1.42-1.42" />
            <circle cx="12" cy="12" r="5" />
        </svg>
        <svg class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
        <span class="sr-only">切换主题</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'">
        浅色
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'">
        深色
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'">
        系统
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
