<script setup lang="ts">
import { contextMenu, currentDevices, useCanvas } from '@/hooks/use-Canvas'
import { scale, screenViewPort } from '@/hooks/use-Pan-Zoom-Canvas'
import type { NodeDevice } from '@/models/node'
import { Rect } from '@/utils/rect'
import { nodeDeviceSize } from '@/utils/settings'
import { Icon } from '@iconify/vue'

const { addDevice } = useCanvas()

const generateDevice = () => {
  const newX = contextMenu.value == null ? null : contextMenu.value.x
  const newY = contextMenu.value == null ? null : contextMenu.value.y

  if (newX == null || newY == null) return

  const newDevice: NodeDevice = {
    isCreated: false,
    rect: Rect.fromLTWH(
      newX / scale.value + screenViewPort.x,
      newY / scale.value + screenViewPort.y,
      nodeDeviceSize.width,
      nodeDeviceSize.height,
    ),
    title: `Device ${currentDevices.value.length + 1}`,
    id: `d-${currentDevices.value.length + 1}`,
    type: 'nodeDevice',
    deviceType: 'switch',
  }

  contextMenu.value = null
  addDevice(newDevice)
}
</script>

<template>
  <div class="bg-slate-600 rounded-lg shadow-lg p-2 w-40">
    <span class="text-sm text-white">Menu Action</span>
    <button
      class="mt-2 w-full flex gap-1 items-center cursor-pointer dark:bg-white dark:text-slate-900 bg-slate-900 text-white rounded-lg font-medium shadow-lg p-2"
      @click="generateDevice"
    >
      <Icon icon="clarity:router-solid" class="text-xl" />
      <span class="dark:text-slate-700 text-white text-sm">Add Device</span>
    </button>
  </div>
</template>
