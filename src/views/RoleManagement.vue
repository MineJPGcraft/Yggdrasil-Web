<script setup>
import { ref, onMounted, watch, nextTick } from 'vue' // 导入 watch
import { getProfileDetailsAPI, uploadSkinAPI } from '@/api.js'
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
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SkinViewer, IdleAnimation } from 'skinview3d' // 导入 SkinViewer

const loading = ref(true)
const error = ref(null)
const profiles = ref([])
const selectedProfile = ref(null)

// 皮肤上传相关状态
const skinFile = ref(null)
const skinModel = ref('default') // 默认为 default
const isUploadingSkin = ref(false)
const uploadMessage = ref('')
const isUploadError = ref(false)

// SkinViewer 相关状态
const skinViewerRef = ref(null)
const canvasRef = ref(null)

// 刷新单个角色详情
const refreshProfileDetails = async (profileId) => {
  try {
    const detailed = await getProfileDetailsAPI(profileId)
    let skinUrl = 'N/A'
    let skinModelVal = 'N/A'
    let uploadableTextures = [] // 可上传的材质类型

    const texturesProp = detailed.properties?.find(prop => prop.name === 'textures')
    if (texturesProp && texturesProp.value) {
      try {
        const decoded = atob(texturesProp.value) // Base64解码
        const texturesData = JSON.parse(decoded)
        // 修正：根据 Yggdrasil API 响应，顶层键是 'skin'，而不是 'textures'
        if (texturesData.skin) {
          skinUrl = texturesData.skin.url
          skinModelVal = texturesData.skin.metadata?.model || 'default'
        }
      } catch (decodeError) {
        console.error('解码或解析纹理数据失败:', decodeError)
      }
    }

    const uploadableTexturesProp = detailed.properties?.find(prop => prop.name === 'uploadableTextures')
    if (uploadableTexturesProp && uploadableTexturesProp.value) {
      uploadableTextures = uploadableTexturesProp.value.split(',')
    }

    // 更新 profiles 列表中的对应项
    const index = profiles.value.findIndex(p => p.id === profileId)
    if (index !== -1) {
      profiles.value[index] = {
        ...detailed, // 包含所有详细信息，如 name, id, properties
        skinUrl: skinUrl,
        skinModel: skinModelVal,
        uploadableTextures: uploadableTextures,
      }
      // 如果当前选中的就是这个角色，也更新选中的角色
      if (selectedProfile.value && selectedProfile.value.id === profileId) {
        selectedProfile.value = profiles.value[index]
      }
    }
  } catch (profileError) {
    console.error(`刷新角色 ${profileId} 详情失败:`, profileError)
  }
}


onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const storedProfiles = localStorage.getItem('availableProfiles')
    if (storedProfiles) {
      const basicProfiles = JSON.parse(storedProfiles)
      if (basicProfiles.length === 0) {
        profiles.value = []
        loading.value = false
        return
      }

      const detailedProfilesPromises = basicProfiles.map(async (p) => {
        try {
          const detailed = await getProfileDetailsAPI(p.id)
          let skinUrl = 'N/A'
          let skinModelVal = 'N/A'
          let uploadableTextures = [] // 可上传的材质类型

          const texturesProp = detailed.properties?.find(prop => prop.name === 'textures')
          if (texturesProp && texturesProp.value) {
            try {
              const decoded = atob(texturesProp.value) // Base64解码
              const texturesData = JSON.parse(decoded)
              // 修正：根据 Yggdrasil API 响应，顶层键是 'skin'，而不是 'textures'
              if (texturesData.skin) {
                skinUrl = texturesData.skin.url
                skinModelVal = texturesData.skin.metadata?.model || 'default'
              }
            } catch (decodeError) {
              console.error('解码或解析纹理数据失败:', decodeError)
            }
          }

          const uploadableTexturesProp = detailed.properties?.find(prop => prop.name === 'uploadableTextures')
          if (uploadableTexturesProp && uploadableTexturesProp.value) {
            uploadableTextures = uploadableTexturesProp.value.split(',')
          }

          return {
            ...detailed, // 包含所有详细信息，如 name, id, properties
            skinUrl: skinUrl,
            skinModel: skinModelVal,
            uploadableTextures: uploadableTextures,
          }
        } catch (profileError) {
          console.error(`获取角色 ${p.name} 详情失败:`, profileError)
          return {
            name: p.name,
            id: p.id,
            skinUrl: '获取失败',
            skinModel: '获取失败',
            uploadableTextures: [],
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

const selectProfile = (profile) => {
  selectedProfile.value = profile
  // 重置上传表单状态
  skinFile.value = null
  skinModel.value = 'default'
  uploadMessage.value = ''
  isUploadError.value = false
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'image/png') {
    skinFile.value = file
    uploadMessage.value = ''
    isUploadError.value = false
  } else {
    skinFile.value = null
    uploadMessage.value = '请选择一个 PNG 格式的图片文件。'
    isUploadError.value = true
  }
}

const handleUploadSkin = async () => {
  if (!selectedProfile.value) {
    uploadMessage.value = '请先选择一个角色。'
    isUploadError.value = true
    return
  }
  if (!skinFile.value) {
    uploadMessage.value = '请选择要上传的皮肤文件。'
    isUploadError.value = true
    return
  }

  isUploadingSkin.value = true
  uploadMessage.value = ''
  isUploadError.value = false

  try {
    await uploadSkinAPI(selectedProfile.value.id, 'skin', skinFile.value, skinModel.value)
    uploadMessage.value = '皮肤上传成功！'
    // 重新获取选定角色的详情以更新预览
    await refreshProfileDetails(selectedProfile.value.id)
    // 清空文件输入
    document.getElementById('skin-file').value = ''
    skinFile.value = null
  } catch (err) {
    console.error('皮肤上传失败:', err)
    uploadMessage.value = err.response?.data?.errorMessage || '皮肤上传失败，请重试。'
    isUploadError.value = true
  } finally {
    isUploadingSkin.value = false
  }
}

// 监听 selectedProfile 变化，更新 SkinViewer
watch(selectedProfile, async (newProfile) => { // watch 函数改为 async
  if (skinViewerRef.value) {
    skinViewerRef.value.dispose() // 销毁旧的 SkinViewer 实例
    skinViewerRef.value = null
  }

  if (newProfile && newProfile.skinUrl && newProfile.skinUrl !== 'N/A') {
    await nextTick(); // 确保 canvas 元素已挂载到 DOM

    if (!canvasRef.value) {
      console.error('SkinViewer 初始化失败: canvas 引用为 null。', canvasRef.value);
      return;
    }

    console.log('准备初始化 SkinViewer:', {
      canvas: canvasRef.value,
      skinUrl: newProfile.skinUrl,
      skinModel: newProfile.skinModel
    });

    try {
      skinViewerRef.value = new SkinViewer({
        canvas: canvasRef.value,
        width: 200, // 预览宽度
        height: 300, // 预览高度
        background: 0xAAAAAA, // 设置一个可见的背景色，方便调试
        transparent: false, // 明确设置为不透明背景
      });

      console.log('SkinViewer 实例创建成功，尝试加载皮肤:', newProfile.skinUrl);
      await skinViewerRef.value.loadSkin(newProfile.skinUrl); // 显式加载皮肤并 await

      // 设置模型
      const model = newProfile.skinModel === 'slim' ? 'slim' : 'default';
      console.log('设置皮肤模型:', model);
      skinViewerRef.value.player.model = model;

      // 添加一些动画和控制
      skinViewerRef.value.animation = new IdleAnimation();
      skinViewerRef.value.autoRotate = true; // 自动旋转
      skinViewerRef.value.camera.position.set(0, 15, 60); // 调整相机位置
      console.log('SkinViewer 初始化和皮肤加载完成。');

    } catch (viewerError) {
      console.error('SkinViewer 初始化或皮肤加载失败:', viewerError);
      // 清理 SkinViewer 实例，防止部分初始化导致问题
      if (skinViewerRef.value) {
        skinViewerRef.value.dispose();
        skinViewerRef.value = null;
      }
    }
  } else {
    console.log('无法初始化 SkinViewer: newProfile, skinUrl 或 canvas 不可用', {
      newProfile: !!newProfile,
      skinUrl: newProfile?.skinUrl,
      canvasRefValue: canvasRef.value
    });
  }
})

</script>

<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">
        角色管理
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
          <CardDescription v-if="profiles.length === 0">您还没有任何角色。请先注册角色。</CardDescription>
        </CardHeader>
        <CardContent v-if="profiles.length > 0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>皮肤模型</TableHead>
                <TableHead>皮肤预览</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="profile in profiles" :key="profile.id">
                <TableCell class="font-medium">{{ profile.name }}</TableCell>
                <TableCell>{{ profile.id }}</TableCell>
                <TableCell>{{ profile.skinModel === 'slim' ? '纤细' : '默认' }}</TableCell>
                <TableCell>
                  <a v-if="profile.skinUrl && profile.skinUrl !== 'N/A' && !profile.error" :href="profile.skinUrl" target="_blank" class="text-primary hover:underline">查看皮肤</a>
                  <span v-else>{{ profile.skinUrl }}</span>
                </TableCell>
                <TableCell class="text-right">
                  <Button size="sm" @click="selectProfile(profile)">选择</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <template v-if="selectedProfile">
        <Card class="mt-8">
          <CardHeader>
            <CardTitle>管理角色: {{ selectedProfile.name }}</CardTitle>
            <CardDescription>UUID: {{ selectedProfile.id }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- 当前皮肤预览 -->
              <div>
                <h3 class="text-lg font-semibold mb-2">皮肤预览</h3>
                <div v-if="selectedProfile.skinUrl && selectedProfile.skinUrl !== 'N/A'">
                  <canvas ref="canvasRef" class="w-full h-auto border rounded-md"></canvas>
                  <p class="text-sm text-muted-foreground mt-2">模型: {{ selectedProfile.skinModel === 'slim' ? '纤细' : '默认' }}</p>
                </div>
                <div v-else>
                  <p class="text-muted-foreground">当前角色没有设置皮肤。</p>
                </div>
              </div>

              <!-- 皮肤上传区 -->
              <div v-if="selectedProfile.uploadableTextures.includes('skin')">
                <h3 class="text-lg font-semibold mb-2">上传新皮肤</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  支持 PNG 格式图片。
                </p>
                <div class="space-y-4">
                  <div class="grid w-full max-w-sm items-center gap-1.5">
                    <Label for="skin-file">选择皮肤文件 (.png)</Label>
                    <Input id="skin-file" type="file" accept="image/png" @change="handleFileChange" />
                  </div>
                  <div class="grid w-full max-w-sm items-center gap-1.5">
                    <Label for="skin-model">皮肤模型</Label>
                    <Select v-model="skinModel">
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="选择皮肤模型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>模型</SelectLabel>
                          <SelectItem value="default">默认 (Steve)</SelectItem>
                          <SelectItem value="slim">纤细 (Alex)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div v-if="uploadMessage" :class="['text-sm font-medium', isUploadError ? 'text-destructive' : 'text-primary']">
                    {{ uploadMessage }}
                  </div>
                  <Button class="w-full" :disabled="isUploadingSkin" @click="handleUploadSkin">
                    {{ isUploadingSkin ? '正在上传...' : '上传皮肤' }}
                  </Button>
                </div>
              </div>
              <div v-else>
                <p class="text-muted-foreground">该角色不支持上传皮肤。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>