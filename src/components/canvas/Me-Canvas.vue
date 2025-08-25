<script setup lang="ts">
import { usePanZoomCanvas } from '@/hooks/use-Pan-Zoom-Canvas'
import { gridCellSize } from '@/utils/settings'
import { useColorMode } from '@vueuse/core'
import MeAppBar from '../app-bar/Me-AppBar.vue'
import { computed } from 'vue'
import MeContextMenu from '../me-context-menu/Me-Context-Menu.vue'
import { contextMenu } from '@/hooks/use-Canvas'
import NodesCanvas from '../objects-canvas/Nodes-Canvas.vue'

const { zoomIn, zoomOut, zoomReset } = usePanZoomCanvas()
import { useGroupSelect } from '@/hooks/use-Group-Select'

const { showGroupRect } = useGroupSelect()

const mode = useColorMode()

const strokeGridColor = computed(() => {
  return mode.value === 'dark' ? 'stroke-slate-500' : 'stroke-slate-600'
})

const bgColor = computed(() => {
  return mode.value === 'dark' ? 'bg-slate-700' : ''
})
</script>

<template>
  <div ref="meCanvasWrapper" class="meCanvasWrapper" :class="bgColor">
    <svg ref="gridViewBox" class="svgBG" preserveAspectRatio="xMidYMid meet">
      <pattern id="grid" :width="gridCellSize" :height="gridCellSize" x="0" y="0" patternUnits="userSpaceOnUse">
        <path :d="`M ${gridCellSize} 0 L 0 0 0 ${gridCellSize}`" :width="gridCellSize" :height="gridCellSize" x="0"
          y="0" fill="none" :class="strokeGridColor" stroke-width="1" stroke-opacity="1"></path>
      </pattern>

      <rect ref="gridRectRef" class="svgBG" fill="url(#grid)"></rect>
    </svg>

    <div ref="meCanvas" class="meCanvas">
      <NodesCanvas />
      <svg class="svgGroupSelecting" v-if="showGroupRect">
        <rect ref="rectGroupSelecting" class="rectGroupSelecting"></rect>
      </svg>
    </div>

    <MeAppBar :zoom-in="zoomIn" :zoom-out="zoomOut" :zoom-reset="zoomReset" />
    <Teleport to="body">
      <MeContextMenu v-if="contextMenu" />
    </Teleport>
  </div>
</template>

<style scoped>
.meCanvasWrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
  overflow: hidden;
}

.meCanvas {
  position: absolute;
  left: 0;
  top: 0;
  touch-action: none;
  z-index: 1000;
}

.svgBG {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.svgGroupSelecting {
  position: absolute;
  overflow: visible;
}

.rectGroupSelecting {
  fill: rgba(41, 134, 204, 0.2);
  stroke: rgba(41, 134, 204, 1);
  position: absolute;
}
</style>
