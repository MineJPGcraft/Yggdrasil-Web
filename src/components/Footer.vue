<script lang="ts" setup>
import {getSiteConfig} from '@/lib/siteConfig'

const config = getSiteConfig()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t bg-background">
    <!-- 主体区：品牌 + 链接列 + 联系方式 + 友情链接 -->
    <div
        v-if="config.footer.about || config.footer.columns.length > 0 || config.footer.contact || config.footer.friendLinks"
        class="container mx-auto px-4 py-12">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <!-- 品牌与描述 -->
        <div class="lg:col-span-2 space-y-4">
          <p class="text-lg font-bold">{{ config.brand.name }}</p>
          <p v-if="config.brand.tagline" class="text-sm text-muted-foreground">{{ config.brand.tagline }}</p>
          <p v-if="config.footer.about" class="max-w-md text-sm leading-relaxed text-muted-foreground">
            {{ config.footer.about }}
          </p>
        </div>

        <!-- 链接列 -->
        <div v-for="column in config.footer.columns" :key="column.title">
          <h3 class="text-sm font-semibold text-foreground">{{ column.title }}</h3>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="link in column.links" :key="link.text">
              <router-link v-if="link.to" :to="link.to"
                           class="text-muted-foreground transition-colors hover:text-foreground">
                {{ link.text }}
              </router-link>
              <a v-else :href="link.url" class="text-muted-foreground transition-colors hover:text-foreground" rel="noopener"
                 target="_blank">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div v-if="config.footer.contact && config.footer.contact.items.length > 0">
          <h3 class="text-sm font-semibold text-foreground">{{ config.footer.contact.title }}</h3>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="item in config.footer.contact.items" :key="item.text">
              <a :href="item.url" class="text-muted-foreground transition-colors hover:text-foreground" rel="noopener"
                 target="_blank">
                {{ item.text }}
              </a>
            </li>
          </ul>
        </div>

        <!-- 友情链接 -->
        <div v-if="config.footer.friendLinks && config.footer.friendLinks.links.length > 0">
          <h3 class="text-sm font-semibold text-foreground">{{ config.footer.friendLinks.title }}</h3>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="link in config.footer.friendLinks.links" :key="link.text">
              <a :href="link.url" class="text-muted-foreground transition-colors hover:text-foreground" rel="noopener"
                 target="_blank">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 底部栏 -->
    <div class="border-t">
      <div
          class="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-muted-foreground md:flex-row">
        <p>
          &copy; {{ currentYear }} {{ config.footer.bottom?.copyright || config.brand.name }}. 版权所有.
        </p>
        <a v-if="config.footer.bottom?.icp?.url" :href="config.footer.bottom.icp.url" class="transition-colors hover:text-foreground" rel="noopener"
           target="_blank">
          {{ config.footer.bottom.icp.text }}
        </a>
        <p v-if="config.footer.bottom?.poweredBy">{{ config.footer.bottom.poweredBy }}</p>
      </div>
    </div>
  </footer>
</template>
