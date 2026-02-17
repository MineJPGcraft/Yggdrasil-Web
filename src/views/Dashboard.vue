<script setup>
import { ref, onMounted } from 'vue'
import { getProfileDetailsAPI } from '@/api.js' // 导入新的 API 函数
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

const profiles = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const storedProfiles = localStorage.getItem('availableProfiles')
    console.log('从localStorage获取的原始availableProfiles:', storedProfiles); // 添加日志

    if (storedProfiles) {
      const basicProfiles = JSON.parse(storedProfiles)
      console.log('解析后的basicProfiles:', basicProfiles); // 添加日志

      if (basicProfiles.length === 0) {
        profiles.value = [] // 没有角色
        loading.value = false
        return
      }


      const detailedProfilesPromises = basicProfiles.map(async (p) => {
        try {
          const detailed = await getProfileDetailsAPI(p.id)
          let skinUrl = 'N/A'
          let skinModel = 'N/A'
          const texturesProp = detailed.properties?.find(prop => prop.name === 'textures')

          if (texturesProp && texturesProp.value) {
            try {
              const decoded = atob(texturesProp.value) // Base64解码
              const texturesData = JSON.parse(decoded)
              if (texturesData.textures && texturesData.textures.SKIN) {
                skinUrl = texturesData.textures.SKIN.url
                skinModel = texturesData.textures.SKIN.metadata?.model || 'default'
              }
            } catch (decodeError) {
              console.error('解码或解析纹理数据失败:', decodeError)
            }
          }

          return {
            name: detailed.name,
            id: detailed.id,
            skinUrl: skinUrl,
            skinModel: skinModel,
          }
        } catch (profileError) {
          console.error(`获取角色 ${p.name} 详情失败:`, profileError)
          return {
            name: p.name,
            id: p.id,
            skinUrl: '获取失败',
            skinModel: '获取失败',
            error: true
          }
        }
      })

      profiles.value = await Promise.all(detailedProfilesPromises)

    } else {
      profiles.value = []
    }
  } catch (err) {
    console.error('加载角色信息失败:', err)
    error.value = '加载角色信息失败。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">
        仪表盘
      </h2>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>正在加载角色信息...</p>
    </div>
    <div v-else-if="error" class="text-center py-8 text-destructive">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <Card>
        <CardHeader>
          <CardTitle>您的角色列表</CardTitle>
          <CardDescription v-if="profiles.length === 0">您还没有任何角色。请注册角色。</CardDescription>
        </CardHeader>
        <CardContent v-if="profiles.length > 0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>皮肤模型</TableHead>
                <TableHead>皮肤预览</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="profile in profiles" :key="profile.id">
                <TableCell class="font-medium">{{ profile.name }}</TableCell>
                <TableCell>{{ profile.id }}</TableCell>
                <TableCell>{{ profile.skinModel }}</TableCell>
                <TableCell>
                  <a v-if="profile.skinUrl && profile.skinUrl !== 'N/A' && !profile.error" :href="profile.skinUrl" target="_blank" class="text-primary hover:underline">查看皮肤</a>
                  <span v-else>{{ profile.skinUrl }}</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>