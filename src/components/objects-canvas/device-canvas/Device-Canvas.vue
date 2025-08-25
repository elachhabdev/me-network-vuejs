<script setup lang="ts">
import { taggedDevices } from '@/hooks/use-Canvas'
import { isLinking, useDragNode } from '@/hooks/use-Drag-Node'
import { nodeDeviceSize, tagsStrokecolors } from '@/utils/settings'
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{
  id: string
  x: number
  y: number
  title: string
  deviceType: string
}>()

const { isActive, isAddingLink, isInGroupSelected } = useDragNode(props.id)

const currentTagged = computed(() => taggedDevices.value.get(props.id))

const mode = useColorMode()
</script>

<template>
  <div ref="nodeRef" class="device-canvas ui-element flex flex-col items-center " :data-id="props.id" :class="{
    isActive: isActive || isInGroupSelected,
    isGroupActive: isInGroupSelected,
    isLinking: isLinking && !isAddingLink,
  }" :style="{
    left: `${props.x}px`,
    top: `${props.y}px`,
  }">
    <div class="img" :style="{ width: `${nodeDeviceSize.width}px`, height: `${nodeDeviceSize.height}px` }">
      <img :src="`/assets/${deviceType}-${mode}.svg`" draggable="false"
        :style="{ width: `${nodeDeviceSize.width}px`, height: `${nodeDeviceSize.height}px` }" :alt="props.title" />

    </div>

    <div class="flex items-center p-0.5 mt-1">
      <Icon icon="material-symbols-light:stop" class="text-xl text-red-600" />
      <span class="whitespace-nowrap tracking-tight text-xs font-semibold dark:text-slate-300">{{ props.title }}</span>
    </div>

    <div class="device-action">
      <button v-for="tag in currentTagged" :key="tag" class="mb-1 mr-1 rounded-2xl w-4 h-4 font-medium text-xs"
        :style="{ background: tagsStrokecolors[tag] }"></button>

      <div class="flex items-center gap-1">
        <button class="cursor-pointer rounded-lg p-1 hover:bg-purple-600 bg-slate-800">
          <Icon icon="iconoir:play-solid" class="text-xl text-white" />
        </button>
        <button class="cursor-pointer rounded-lg p-1 hover:bg-teal-600 bg-slate-800">
          <Icon icon="basil:edit-solid" class="text-xl text-white" />
        </button>
      </div>
    </div>
    <div class="device-plug" :style="{ top: `${nodeDeviceSize.height / 2}px` }">
      <Icon icon="fa:plug" class="plug text-xl text-orange-400" />
    </div>
  </div>
  <svg class="svgAddingLink" :data-id="props.id" v-if="isAddingLink">
    <path ref="pathAddingLinkRef" class="pathAddingLink" :class="{ dark: mode === 'dark' }"></path>
  </svg>
</template>

<style scoped>
.device-canvas {
  position: absolute;
  cursor: pointer;
  z-index: 200;
  will-change: 'transform';
}

.device-action {
  position: absolute;
  left: 0;
  top: 0;
  display: none;
  transform: translate(-25%, -100%);
  padding: 10px;
}

.device-plug {
  position: absolute;
  right: 0;
  transform: translate(50%, -50%);
  display: none;
}

.device-plug .plug {
  filter: drop-shadow(0 0 2px black);
  transition: all 0.3s ease;
  transform: scale(1);
}

.device-canvas:hover .device-plug {
  display: block;
}

.device-canvas:hover .device-action {
  display: block;
}

.device-canvas.isActive .device-plug {
  display: block;
}

.device-canvas.isActive .device-action {
  display: block;
}

.device-canvas.isLinking:hover img {
  filter: brightness(0.5);
}

.img {
  position: relative;
}

.device-canvas.isGroupActive .img::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  border: 2px solid greenyellow;
  background: rgba(172, 255, 47, 0.6);
  width: calc(100% + 12px);
  height: calc(100% + 12px);
  border-radius: 50%;
  z-index: -1;
  transform: translate(-6px, -6px);
  display: block;
}

.device-plug:hover .plug {
  transform: scale(1.5);
  transition: all 0.3s ease;
}

.svgAddingLink {
  overflow: visible;
  position: absolute;
  pointer-events: none;
  z-index: 201;
}

.pathAddingLink {
  position: absolute;
  fill: none;
  stroke: green;
  stroke-width: 3;
}

.pathAddingLink.dark {
  stroke: #7cfc00;

}
</style>
