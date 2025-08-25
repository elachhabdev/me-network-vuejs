<script setup lang="ts">
import { contextMenu, taggedDevices, useCanvas } from '@/hooks/use-Canvas'
import { tags } from '@/utils/settings'
import { Icon } from '@iconify/vue'
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  nodeId: string
}>()

const { updateDeviceTags } = useCanvas()

const selectedTagsArray = ref<string[]>([])

const selectedTagsSet = computed(() => new Set(selectedTagsArray.value))

const initializeTags = (nodeId: string) => {
  if (taggedDevices.value.has(nodeId)) {
    const deviceTags = taggedDevices.value.get(nodeId) ?? new Set()
    selectedTagsArray.value = Array.from(deviceTags)
  } else {
    selectedTagsArray.value = []
  }
}

// Watch for nodeId changes
watch(
  () => props.nodeId,
  (newNodeId) => {
    if (newNodeId) {
      initializeTags(newNodeId)
    }
  },
  { immediate: true },
)

const updateTags = () => {
  contextMenu.value = null
  if (props.nodeId && selectedTagsSet.value.size > 0) {
    updateDeviceTags(selectedTagsSet.value, props.nodeId)
  }
}
</script>

<template>
  <div class="bg-slate-600 rounded-lg shadow-lg p-2">
    <span class="text-sm text-white">Menu Action</span>
    <ul
      class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <li
        v-for="tag in tags"
        :key="tag"
        class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
      >
        <div class="flex items-center ps-3">
          <input
            :id="`tag-${tag}-${nodeId}`"
            type="checkbox"
            :value="tag"
            v-model="selectedTagsArray"
            name="list-radio"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <label
            :for="`tag-${tag}-${nodeId}`"
            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >{{ tag }}
          </label>
        </div>
      </li>
    </ul>
    <button
      @click="updateTags"
      class="w-full flex mt-2 gap-1 items-center cursor-pointer dark:bg-white dark:text-slate-900 bg-slate-900 text-white rounded-lg font-medium shadow-lg p-2"
    >
      <Icon icon="clarity:router-solid" class="text-xl" />
      <span class="dark:text-slate-700 text-white text-sm">Update Tags</span>
    </button>
  </div>
</template>
