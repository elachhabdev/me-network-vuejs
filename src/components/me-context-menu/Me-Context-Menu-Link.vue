<script setup lang="ts">
import { contextMenu, useCanvas } from '@/hooks/use-Canvas'
import type { typeLink } from '@/models/link'
import { Icon } from '@iconify/vue'
import { ref, watch } from 'vue'

const props = defineProps<{
  linkId: string
  TypeLink: typeLink | undefined
}>()

const { updateLinkType } = useCanvas()

const types: typeLink[] = ['straight', 's-curve', 'flowchart']

const selectedType = ref<typeLink | undefined>(props.TypeLink)

watch(
  [() => props.linkId, () => props.TypeLink],
  ([newLinkId, newTypeLink]) => {
    selectedType.value = newTypeLink
  },
  { immediate: true },
)

const updateLink = () => {
  contextMenu.value = null
  if (props.linkId && selectedType.value) {
    updateLinkType(props.linkId, selectedType.value)
  }
}

const radioGroupName = `link-type-${props.linkId}`
</script>

<template>
  <div class="bg-slate-600 rounded-lg shadow-lg p-2">
    <span class="text-sm text-white mb-2 block">Link Type</span>

    <ul
      class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      <li v-for="type in types" :key="type"
        class="w-full border-b border-gray-200 last:border-b-0 dark:border-gray-600">
        <div class="flex items-center ps-3">
          <input :id="`${type}-${linkId}`" type="radio" :value="type" v-model="selectedType" :name="radioGroupName"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
          <label :for="`${type}-${linkId}`"
            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer capitalize">
            {{ type }}
          </label>
        </div>
      </li>
    </ul>

    <button @click="updateLink"
      class="w-full flex mt-2 gap-1 items-center cursor-pointer dark:bg-white dark:text-slate-900 bg-slate-900 text-white rounded-lg font-medium shadow-lg p-2 hover:opacity-90 transition-opacity">
      <Icon icon="mdi:link-variant" class="text-xl" />
      <span class="text-sm">Update Link</span>
    </button>
  </div>
</template>
