<script lang="ts" setup>
import {Moon, Sun} from 'lucide-vue-next'
import {useTheme} from '@/composables/useTheme'
import {themeOptions} from '@/themes/themes'
import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'

const {preset, setTheme} = useTheme()

// 手动选择主题时写 'light' / 'dark' / 'ocean'，与「跟随系统」区分
const chooseTheme = (value: string) => setTheme(value as 'light' | 'dark' | 'ocean' | 'system')
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
        <span class="sr-only">切换主题</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <!-- 跟随系统：按浏览器深浅色偏好自动切换 -->
      <DropdownMenuItem :class="preset === 'system' ? 'font-semibold' : ''" @click="chooseTheme('system')">
        跟随系统
      </DropdownMenuItem>
      <DropdownMenuItem
          v-for="option in themeOptions"
          :key="option.value"
          :class="preset === option.value ? 'font-semibold' : ''"
          @click="chooseTheme(option.value)"
      >
        {{ option.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>