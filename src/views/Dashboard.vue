<script setup>
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const stats = [
  { title: '总收入', value: '¥45,231.89', change: '比上月增长20.1%', icon: 'dollar-sign' },
  { title: '订阅数', value: '+2350', change: '比上月增长180.1%', icon: 'users' },
  { title: '销售额', value: '+12,234', change: '比上月增长19%', icon: 'credit-card' },
  { title: '活跃用户', value: '+573', change: '比上个小时增长201', icon: 'activity' },
]

const recentSales = [
    { name: '奥利维亚·马丁', email: 'olivia.martin@email.com', amount: '¥1,999.00' },
    { name: '杰克逊·李', email: 'jackson.lee@email.com', amount: '¥39.00' },
    { name: '伊莎贝拉·阮', email: 'isabella.nguyen@email.com', amount: '¥299.00' },
    { name: '威廉·金', email: 'will@email.com', amount: '¥99.00' },
    { name: '索菲亚·戴维斯', email: 'sofia.davis@email.com', amount: '¥39.00' },
]

const iconMap = {
    'dollar-sign': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground h-4 w-4"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    'users': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    'credit-card': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground h-4 w-4"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    'activity': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground h-4 w-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
}
</script>

<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">
        仪表盘
      </h2>
      <div class="hidden md:flex items-center space-x-2">
        <Button>下载</Button>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            {{ stat.title }}
          </CardTitle>
          <div v-html="iconMap[stat.icon]"></div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ stat.value }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ stat.change }}
          </p>
        </CardContent>
      </Card>
    </div>
    <div class="grid gap-4">
       <Card>
        <CardHeader>
          <CardTitle>最近销售</CardTitle>
          <CardDescription>本月您已完成265笔销售。</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>客户</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead class="text-right">金额</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="sale in recentSales" :key="sale.email">
                        <TableCell class="font-medium">{{ sale.name }}</TableCell>
                        <TableCell>{{ sale.email }}</TableCell>
                        <TableCell class="text-right">{{ sale.amount }}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>