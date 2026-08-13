<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {getServerMeta, getServerStatus} from '@/api'
import {baseURL} from '@/api/http'
import {type FeatureItemConfig, getSiteConfig} from '@/lib/siteConfig'
import {setPageMeta} from '@/lib/seo'
import {Check, X} from 'lucide-vue-next'

const config = getSiteConfig()

// 站点信息：Hero 区配置（来自 public/config.json）
const hero = config.home.hero

// 后端实时状态
const motd = ref('')
const homepageLink = ref<string | undefined>(undefined)
const serverFeatures = ref<Record<string, boolean> | null>(null)

/** 计算 authlib-injector 的 Yggdrasil API 地址（供玩家填入启动器） */
const apiLocation = computed(() => {
  const suffix = '/yggdrasil/'
  if (baseURL.startsWith('http')) {
    return `${baseURL}${suffix}`
  }
  return `${window.location.origin}${baseURL}${suffix}`
})

/** 特性卡片：配置了 flag 时以后端实时开关为准，否则用配置默认值 */
const featureItems = computed(() =>
    config.home.features.items.map((item: FeatureItemConfig) => ({
      ...item,
      enabled: item.flag && serverFeatures.value
          ? !!serverFeatures.value[item.flag]
          : (item.enabled ?? true)
    }))
)

onMounted(async () => {
  // 首页标题使用站点配置的 seo.title（覆盖 afterEach 的「首页 - 站名」）
  setPageMeta(config.seo.title, config.seo.description)

  try {
    const meta = await getServerMeta()
    homepageLink.value = meta?.links?.homepage || undefined
  } catch {
    /* 元数据不可用时忽略 */
  }

  try {
    const status = await getServerStatus()
    motd.value = status.motd || ''
    serverFeatures.value = status.feature as unknown as Record<string, boolean>
  } catch {
    /* 服务器状态不可用时，特性卡片回退到配置默认值 */
  }
})
</script>

<template>
  <div class="flex-1">
    <!-- Hero -->
    <section class="container mx-auto px-4 py-16 md:py-24">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div class="space-y-6 text-center lg:text-left">
          <span v-if="hero.badge"
                class="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {{ hero.badge }}
          </span>
          <h1 class="text-4xl font-bold md:text-6xl">
            {{ hero.title }}
            <span v-if="hero.titleHighlight" class="text-primary">{{ hero.titleHighlight }}</span>
          </h1>
          <p class="mx-auto text-lg text-muted-foreground md:text-xl lg:mx-0 lg:max-w-xl">
            {{ hero.description }}
          </p>

          <blockquote v-if="motd && hero.showMotd"
                      class="mx-auto border-l-4 border-primary pl-4 text-left text-muted-foreground italic lg:mx-0">
            {{ motd }}
          </blockquote>

          <div class="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button as-child size="lg">
              <router-link :to="hero.primaryCta.to || hero.primaryCta.url || '/'">
                {{ hero.primaryCta.text }}
              </router-link>
            </Button>
            <Button as-child size="lg" variant="outline">
              <router-link :to="hero.secondaryCta.to || hero.secondaryCta.url || '/login'">
                {{ hero.secondaryCta.text }}
              </router-link>
            </Button>
          </div>
        </div>

        <!-- 右侧图形 -->
        <div class="hidden lg:block">
          <svg aria-hidden="true" class="mx-auto w-full max-w-md text-primary" viewBox="0 0 256 256"
               xmlns="http://www.w3.org/2000/svg">
            <rect fill="none" height="256" width="256"/>
            <path d="M88,134.9,176,224l32-32L120,104,208,16l-32,32L99.1,128Z" opacity="0.2"/>
            <path d="M208,16,99.1,128l-4.2,4.2a48,48,0,0,0,67.8,67.9L176,187.3,224,80Z" fill="none"
                  stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
            <path d="M164.2,199.1a48,48,0,0,1-67.9-67.8L120,108,32,224l80-48,12.7,12.7A47.9,47.9,0,0,1,164.2,199.1Z"
                  fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section v-if="config.home.features.enabled && featureItems.length > 0" class="border-y bg-muted/40">
      <div class="container mx-auto px-4 py-16 md:py-20">
        <h2 class="text-center text-2xl font-bold md:text-3xl">{{ config.home.features.title }}</h2>
        <p v-if="config.home.features.description" class="mt-3 text-center text-muted-foreground">
          {{ config.home.features.description }}
        </p>
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card v-for="item in featureItems" :key="item.label">
            <CardHeader class="flex flex-row items-center gap-3 space-y-0">
              <span
                  :class="item.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
                  class="rounded-full p-2"
              >
                <Check v-if="item.enabled" aria-hidden="true" class="h-4 w-4"/>
                <X v-else aria-hidden="true" class="h-4 w-4"/>
              </span>
              <CardTitle class="text-base">{{ item.label }}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{{ item.description }}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- 启动器接入指引 -->
    <section v-if="config.home.launcherGuide.enabled" class="container mx-auto px-4 py-16 md:py-20">
      <Card class="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{{ config.home.launcherGuide.title }}</CardTitle>
          <CardDescription>{{ config.home.launcherGuide.description }}</CardDescription>
        </CardHeader>
        <CardContent v-if="config.home.launcherGuide.showApiLocation" class="space-y-4">
          <code class="block break-all rounded-md bg-muted px-4 py-3 text-sm">
            {{ apiLocation }}
          </code>
          <p class="text-sm text-muted-foreground">
            <a v-if="homepageLink" :href="homepageLink" class="text-primary hover:underline" rel="noopener"
               target="_blank">
              {{ config.home.launcherGuide.homepageLinkText || '访问验证服务器首页' }}
            </a>
          </p>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
