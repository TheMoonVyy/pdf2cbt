<script setup lang="ts">
interface Props {
  contentClass?: ClassValue
  iconClass?: ClassValue
  content: string | VNode | (() => VNode)
  iconName?: string
  iconSize?: string
}

const {
  content,
  contentClass,
  iconClass,
  iconSize = '1.125rem',
  iconName = 'my-icon:info',
} = defineProps<Props>()

const toRenderFn = (val?: string | VNode | (() => VNode)) => {
  if (typeof val === 'string') {
    return () => h('div', val)
  }
  else if (typeof val === 'function') {
    return val
  }
  else if (val) {
    return () => val
  }
  return null
}

const renderContent = computed(() => toRenderFn(content))
</script>

<template>
  <div class="flex items-center">
    <UiHoverCard>
      <UiHoverCardTrigger as-child>
        <Icon
          tabindex="-1"
          class="focus-visible:outline-hidden"
          :name="iconName"
          :size="iconSize"
          :class="iconClass"
        />
      </UiHoverCardTrigger>

      <UiHoverCardContent
        class="bg-[color-mix(in_srgb,_theme(colors.gray.900),_black_10%)] text-white text-base
          sm:min-w-sm sm:max-w-max"
        :class="contentClass"
        avoid-collisions
        :collision-padding="16"
      >
        <template v-if="renderContent">
          <component :is="renderContent" />
        </template>
      </UiHoverCardContent>
    </UiHoverCard>
  </div>
</template>

<style scoped>
p {
  margin-left: 0;
  margin-right: 0;
}
</style>
