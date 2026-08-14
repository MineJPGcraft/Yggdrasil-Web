<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue' // 导入 watch
import {
  createYggdrasilProfile,
  deleteYggdrasilProfile,
  getProfileDetailsAPI,
  getYggdrasilProfiles,
  uploadTextureAPI,
} from '@/api'
import {parseTexturesProperty, parseUploadableTextures, toSameOriginUrl} from '@/lib/textures'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {IdleAnimation, SkinViewer} from 'skinview3d' // 导入 SkinViewer
import {AxiosError} from 'axios'

interface ProfileDetail {
  id: string
  name: string
  properties?: { name: string; value: string }[]
  skinUrl: string
  skinModel: string
  uploadableTextures: string[]
  error?: boolean
}

const loading = ref(true)
const error = ref<string | null>(null)
const profiles = ref<ProfileDetail[]>([])
const selectedProfile = ref<ProfileDetail | null>(null)

// 创建角色相关状态
const newRoleName = ref('')
const isCreatingRole = ref(false)
const createRoleMessage = ref('')
const isCreateRoleError = ref(false)

// 删除角色相关状态
const deletingRoleId = ref('')
const deleteRoleMessage = ref('')
const isDeleteRoleError = ref(false)

// 皮肤上传相关状态
const skinFile = ref<File | null>(null)
const skinModel = ref('default') // 默认为 default
const isUploadingSkin = ref(false)
const uploadMessage = ref('')
const isUploadError = ref(false)

// 披风上传相关状态
const capeFile = ref<File | null>(null)
const isUploadingCape = ref(false)
const capeMessage = ref('')
const isCapeError = ref(false)

// 材质上传能力（依据 uploadableTextures：skin,cape → 皮肤+披风；skin → 仅皮肤；空 → 不能上传）
const canUpload = computed(() => (selectedProfile.value?.uploadableTextures.length ?? 0) > 0)
const canUploadSkin = computed(() => selectedProfile.value?.uploadableTextures.includes('skin') ?? false)
const canUploadCape = computed(() => selectedProfile.value?.uploadableTextures.includes('cape') ?? false)

// SkinViewer 相关状态
const skinViewerRef = ref<SkinViewer | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// 加载单个角色的完整详情（含皮肤信息与可上传材质类型）
const loadProfileDetail = async (p: { id: string; name: string }): Promise<ProfileDetail> => {
  const detailed = await getProfileDetailsAPI(p.id)
  const {skinUrl, skinModel: parsedModel} = parseTexturesProperty(detailed.properties)
  return {
    ...detailed, // 包含所有详细信息，如 name, id, properties
    skinUrl: skinUrl || 'N/A',
    skinModel: parsedModel || 'N/A',
    uploadableTextures: parseUploadableTextures(detailed.properties),
    error: false
  }
}

// 刷新单个角色详情，并同步更新列表与当前选中项
const refreshProfileDetails = async (profileId: string) => {
  try {
    const updated = await loadProfileDetail({id: profileId, name: ''})
    const index = profiles.value.findIndex(p => p.id === profileId)
    if (index !== -1) {
      profiles.value[index] = updated
      // 如果当前选中的就是这个角色，也更新选中的角色
      if (selectedProfile.value && selectedProfile.value.id === profileId) {
        selectedProfile.value = updated
      }
    }
  } catch (profileError) {
    console.error(`刷新角色 ${profileId} 详情失败:`, profileError)
  }
}

onMounted(async () => {
  await loadProfiles()
})

/** 加载当前账号的角色列表及详情 */
const loadProfiles = async () => {
  loading.value = true
  error.value = null
  try {
    // 通过 Cookie 会话获取当前账号的角色列表
    const list = await getYggdrasilProfiles()
    const basicProfiles = list.profiles
    if (basicProfiles.length === 0) {
      profiles.value = []
      loading.value = false
      return
    }

    const detailedProfilesPromises = basicProfiles.map(async (p) => {
      try {
        return await loadProfileDetail(p)
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
  } catch (err) {
    console.error('加载角色信息失败:', err)
    error.value = '加载角色信息失败。'
  } finally {
    loading.value = false
  }
}

// 创建角色
const handleCreateRole = async () => {
  createRoleMessage.value = ''
  isCreateRoleError.value = false
  if (!newRoleName.value.trim()) {
    createRoleMessage.value = '请输入角色名称。'
    isCreateRoleError.value = true
    return
  }
  isCreatingRole.value = true
  try {
    await createYggdrasilProfile(newRoleName.value.trim())
    createRoleMessage.value = '角色创建成功。'
    newRoleName.value = ''
    await loadProfiles()
  } catch (err) {
    console.error('创建角色失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    createRoleMessage.value = axiosErr.response?.data?.errorMessage || '角色创建失败，请重试。'
    isCreateRoleError.value = true
  } finally {
    isCreatingRole.value = false
  }
}

// 删除角色
const handleDeleteRole = async (profileId: string) => {
  const profile = profiles.value.find(p => p.id === profileId)
  if (!window.confirm(`确定删除角色「${profile?.name || profileId}」吗？删除后其绑定的启动器会话与令牌将自动失效。`)) {
    return
  }
  deleteRoleMessage.value = ''
  isDeleteRoleError.value = false
  deletingRoleId.value = profileId
  try {
    await deleteYggdrasilProfile(profileId)
    deleteRoleMessage.value = '角色删除成功。'
    if (selectedProfile.value?.id === profileId) {
      selectedProfile.value = null
    }
    await loadProfiles()
  } catch (err) {
    console.error('删除角色失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    deleteRoleMessage.value = axiosErr.response?.data?.errorMessage || '角色删除失败，请重试。'
    isDeleteRoleError.value = true
  } finally {
    deletingRoleId.value = ''
  }
}

const selectProfile = (profile: ProfileDetail) => {
  selectedProfile.value = profile
  // 重置上传表单状态
  skinFile.value = null
  skinModel.value = 'default'
  uploadMessage.value = ''
  isUploadError.value = false
  capeFile.value = null
  capeMessage.value = ''
  isCapeError.value = false
}

const handleFileChange = (event: Event, type: 'skin' | 'cape') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type === 'image/png') {
    if (type === 'skin') {
      skinFile.value = file
      uploadMessage.value = ''
      isUploadError.value = false
    } else {
      capeFile.value = file
      capeMessage.value = ''
      isCapeError.value = false
    }
  } else {
    if (type === 'skin') {
      skinFile.value = null
      uploadMessage.value = '请选择一个 PNG 格式的图片文件。'
      isUploadError.value = true
    } else {
      capeFile.value = null
      capeMessage.value = '请选择一个 PNG 格式的图片文件。'
      isCapeError.value = true
    }
  }
}

/** 材质上传使用前端专属 Cookie 身份验证端点（PUT /yggdrasil/profiles/{uuid}/{textureType}），无需 Bearer accessToken */
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
    const model = skinModel.value === 'slim' ? 'slim' as const : '' as const
    await uploadTextureAPI(selectedProfile.value.id, 'skin', skinFile.value, model)

    uploadMessage.value = '皮肤上传成功！'
    // 重新获取选定角色的详情以更新预览
    await refreshProfileDetails(selectedProfile.value.id)
    // 清空文件输入
    const input = document.getElementById('skin-file') as HTMLInputElement | null
    if (input) input.value = ''
    skinFile.value = null
  } catch (err) {
    console.error('皮肤上传失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    uploadMessage.value = axiosErr.response?.data?.errorMessage || '皮肤上传失败，请重试。'
    isUploadError.value = true
  } finally {
    isUploadingSkin.value = false
  }
}

const handleUploadCape = async () => {
  if (!selectedProfile.value) {
    capeMessage.value = '请先选择一个角色。'
    isCapeError.value = true
    return
  }
  if (!capeFile.value) {
    capeMessage.value = '请选择要上传的披风文件。'
    isCapeError.value = true
    return
  }

  isUploadingCape.value = true
  capeMessage.value = ''
  isCapeError.value = false

  try {
    await uploadTextureAPI(selectedProfile.value.id, 'cape', capeFile.value, '')

    capeMessage.value = '披风上传成功！'
    // 重新获取选定角色的详情以更新预览
    await refreshProfileDetails(selectedProfile.value.id)
    // 清空文件输入
    const input = document.getElementById('cape-file') as HTMLInputElement | null
    if (input) input.value = ''
    capeFile.value = null
  } catch (err) {
    console.error('披风上传失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    capeMessage.value = axiosErr.response?.data?.errorMessage || '披风上传失败，请重试。'
    isCapeError.value = true
  } finally {
    isUploadingCape.value = false
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
      });

      console.log('SkinViewer 实例创建成功，尝试加载皮肤:', newProfile.skinUrl);
      // 材质 URL 为跨源绝对地址，需转为同源相对 URL（经 /api 反代）以规避皮肤图片的 CORS 限制
      await skinViewerRef.value.loadSkin(toSameOriginUrl(newProfile.skinUrl)); // 显式加载皮肤并 await

      // 设置模型
      const model = newProfile.skinModel === 'slim' ? 'slim' : 'default';
      console.log('设置皮肤模型:', model);
      skinViewerRef.value.playerObject.skin.modelType = model;

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
      <!-- 创建角色 -->
      <Card>
        <CardHeader>
          <CardTitle>创建角色</CardTitle>
          <CardDescription>为您的账号创建一个 Minecraft 角色。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid w-full max-w-sm items-center gap-1.5">
            <Label for="role-name">角色名称</Label>
            <Input id="role-name" v-model="newRoleName" placeholder="请输入角色名称"/>
          </div>
          <div v-if="createRoleMessage"
               :class="['text-sm font-medium', isCreateRoleError ? 'text-destructive' : 'text-primary']">
            {{ createRoleMessage }}
          </div>
          <Button :disabled="isCreatingRole" @click="handleCreateRole">
            {{ isCreatingRole ? '创建中...' : '创建角色' }}
          </Button>
        </CardContent>
      </Card>

      <Card class="mt-8">
        <CardHeader>
          <CardTitle>您的角色列表</CardTitle>
          <CardDescription v-if="profiles.length === 0">您还没有任何角色。请先注册角色。</CardDescription>
        </CardHeader>
        <CardContent v-if="profiles.length > 0">
          <div v-if="deleteRoleMessage"
               :class="['text-sm font-medium mb-4', isDeleteRoleError ? 'text-destructive' : 'text-primary']">
            {{ deleteRoleMessage }}
          </div>
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
                <TableCell class="text-right space-x-2">
                  <Button size="sm" @click="selectProfile(profile)">选择</Button>
                  <Button :disabled="deletingRoleId === profile.id" size="sm" variant="destructive"
                          @click="handleDeleteRole(profile.id)">
                    {{ deletingRoleId === profile.id ? '删除中...' : '删除' }}
                  </Button>
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

              <!-- 材质上传区（依据 uploadableTextures 决定皮肤/披风上传能力） -->
              <div v-if="canUpload">
                <!-- 皮肤上传 -->
                <div v-if="canUploadSkin">
                  <h3 class="text-lg font-semibold mb-2">上传新皮肤</h3>
                  <p class="text-sm text-muted-foreground mb-4">
                    支持 PNG 格式图片。
                  </p>
                  <div class="space-y-4">
                    <div class="grid w-full max-w-sm items-center gap-1.5">
                      <Label for="skin-file">选择皮肤文件 (.png)</Label>
                      <Input id="skin-file" accept="image/png" type="file" @change="handleFileChange($event, 'skin')"/>
                    </div>
                    <div class="grid w-full max-w-sm items-center gap-1.5">
                      <Label for="skin-model">皮肤模型</Label>
                      <Select v-model="skinModel">
                        <SelectTrigger class="w-[180px]">
                          <SelectValue placeholder="选择皮肤模型"/>
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
                    <div v-if="uploadMessage"
                         :class="['text-sm font-medium', isUploadError ? 'text-destructive' : 'text-primary']">
                      {{ uploadMessage }}
                    </div>
                    <Button :disabled="isUploadingSkin" class="w-full" @click="handleUploadSkin">
                      {{ isUploadingSkin ? '正在上传...' : '上传皮肤' }}
                    </Button>
                  </div>
                </div>

                <!-- 披风上传 -->
                <div v-if="canUploadCape" class="mt-6">
                  <h3 class="text-lg font-semibold mb-2">上传新披风</h3>
                  <p class="text-sm text-muted-foreground mb-4">
                    支持 PNG 格式图片。
                  </p>
                  <div class="space-y-4">
                    <div class="grid w-full max-w-sm items-center gap-1.5">
                      <Label for="cape-file">选择披风文件 (.png)</Label>
                      <Input id="cape-file" accept="image/png" type="file" @change="handleFileChange($event, 'cape')"/>
                    </div>
                    <div v-if="capeMessage"
                         :class="['text-sm font-medium', isCapeError ? 'text-destructive' : 'text-primary']">
                      {{ capeMessage }}
                    </div>
                    <Button :disabled="isUploadingCape" class="w-full" @click="handleUploadCape">
                      {{ isUploadingCape ? '正在上传...' : '上传披风' }}
                    </Button>
                  </div>
                </div>
              </div>
              <div v-else>
                <p class="text-muted-foreground">您不能上传材质。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
