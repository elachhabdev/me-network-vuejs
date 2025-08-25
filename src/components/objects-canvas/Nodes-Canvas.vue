<script setup lang="ts">
import { currentLinks, visibleDevices } from '@/hooks/use-Canvas'
import DeviceCanvas from './device-canvas/Device-Canvas.vue'
import LinkDevice from './link-canvas/Link-Device.vue'
import { tags } from '@/utils/settings'
import TagsCanvas from './tags-canvas/Tags-Canvas.vue'
import { isNodeActive } from '@/hooks/use-Drag-Node'
</script>
<template>
  <div class="tags-canvas" v-if="!isNodeActive">
    <TagsCanvas v-for="tag in tags" :key="tag" :tag="tag"></TagsCanvas>
  </div>

  <div class="links-canvas">
    <LinkDevice v-for="link in currentLinks" :key="link.id" :link="link" />
  </div>

  <div class="devices-canvas">
    <DeviceCanvas
      v-for="device in visibleDevices"
      :key="device.id"
      :id="device.id"
      :x="device.rect.x"
      :y="device.rect.y"
      :title="device.title"
      :deviceType="device.deviceType"
    />
  </div>
</template>

<style scoped>
.devices-canvas {
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
}

.links-canvas {
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
}

.tags-canvas {
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
}

.tags-svg {
  position: absolute;
  overflow: visible;
}
</style>
