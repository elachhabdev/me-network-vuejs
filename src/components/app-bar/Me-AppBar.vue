<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { currentMode, useCanvas } from '@/hooks/use-Canvas'
import { scale } from '@/hooks/use-Pan-Zoom-Canvas'
defineProps<{
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
}>()

const mode = useColorMode()

const { setSelectionMode } = useCanvas()

const setMode = (mode: 'selecting' | 'panning') => {
  setSelectionMode(mode)
}

const toggleMode = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}


</script>
<template>
  <div class="flex items-end gap-1.5 p-2 ui-element appBar-info">
    <span
      class="ui-element bg-orange-900 text-orange-200 border-2 border-orange-500 text-xs rounded-lg font-medium shadow p-0.5 pl-2 pr-2">{{
        currentMode }}</span>
    <span
      class="ui-element bg-purple-900 text-purple-200 border-2 border-purple-500 text-xs rounded-lg font-medium shadow p-0.5 pl-2 pr-2"><b>Zoom:</b>{{
        scale * 100 }} %</span>
    <button
      class="ui-element cursor-pointer bg-teal-900 text-teal-200 border-2 border-teal-500 rounded-lg font-medium shadow p-0.5 pl-1 pr-1"
      @click="zoomReset">
      <Icon icon="tabler:zoom-cancel" class="text-lg" />
    </button>

    <button
      class="ui-element cursor-pointer bg-yellow-900 text-yellow-200 border-2 border-yellow-500 rounded-lg font-medium shadow p-0.5 pl-1 pr-1"
      @click="toggleMode">
      <Icon :icon="mode == 'dark' ? 'material-symbols:light-mode-rounded' : 'material-symbols:light-mode-outline-rounded'"
        class="text-lg" />
    </button>
  </div>
  <div class="flex items-center gap-1.5 ui-element appBar-mode">
    <div class="flex items-center gap-2 p-2 shadow-xl rounded-lg">
      <button class="ui-element cursor-pointer flex gap-1 items-center font-medium shadow p-2 pr-3 rounded-lg"
        @click="setMode('selecting')" :class="{
          'bg-purple-900': currentMode == 'selecting',
          'dark:bg-slate-800 bg-slate-300': currentMode == 'panning',
          'text-slate-800 dark:text-slate-100': currentMode == 'panning',
          'text-white': currentMode == 'selecting',
        }">
        <Icon icon="material-symbols:arrow-selector-tool-rounded" class="text-xl" />
        <span class="text-sm">Select</span>
      </button>
      <button class="ui-element cursor-pointer flex items-center gap-1 font-medium p-2 rounded-lg" :class="{
        'bg-purple-900': currentMode == 'panning',
        'dark:bg-slate-800 bg-slate-300': currentMode == 'selecting',
        'text-slate-800 dark:text-slate-100': currentMode == 'selecting',
        'text-white': currentMode == 'panning',
      }" @click="setMode('panning')">
        <Icon icon="material-symbols:pan-tool" class="text-xl" />
        <span class="text-sm">Panning</span>
      </button>
    </div>

    <button
      class="ui-element cursor-pointer dark:bg-white dark:text-slate-900 bg-slate-900 text-white rounded-lg font-medium shadow-lg p-2"
      @click="zoomOut">
      <Icon icon="tabler:zoom-out" class="text-lg" />
    </button>

    <button
      class="ui-element cursor-pointer dark:bg-white dark:text-slate-900 bg-slate-900 text-white rounded-lg font-medium shadow-lg p-2"
      @click="zoomIn">
      <Icon icon="tabler:zoom-in" class="text-lg" />
    </button>
  </div>
</template>

<style scoped>
.appBar-mode {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.appBar-info {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 9999;
}
</style>
