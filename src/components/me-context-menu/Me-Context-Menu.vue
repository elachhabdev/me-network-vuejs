<script setup lang="ts">
import { contextMenu } from '@/hooks/use-Canvas'
import MeContextMenuCanvas from './Me-Context-Menu-Canvas.vue'
import MeContextMenuLink from './Me-Context-Menu-Link.vue'
import MeContextMenuDevice from './Me-Context-Menu-Device.vue'
</script>
<template>
  <div
    class="contextMenu ui-element"
    :style="{
      left: `${contextMenu == null ? 0 : contextMenu.x}px`,
      top: `${contextMenu == null ? 0 : contextMenu.y}px`,
    }"
  >
    <MeContextMenuCanvas v-if="contextMenu?.actionContextMenu == 'canvas'" />
    <MeContextMenuLink
      v-if="contextMenu?.actionContextMenu == 'link'"
      :linkId="contextMenu.id"
      :TypeLink="contextMenu.options.typeLink"
    />
    <MeContextMenuDevice
      v-if="contextMenu?.actionContextMenu == 'nodeDevice'"
      :nodeId="contextMenu.id"
    />
  </div>
</template>
<style scoped>
.contextMenu {
  position: absolute;
  z-index: 1001;
}
</style>
