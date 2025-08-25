<script setup lang="ts">
import { currentDevices, taggedDevices } from '@/hooks/use-Canvas'
import {
  convexHull,
  deviceRectToPointsWithPadding,
  generatePathConvexHull,
  polygonCentroid,
} from '@/utils/convex-hull'
import { tagscolors, tagsStrokecolors } from '@/utils/settings'
import { intersectionSets } from '@/utils/utils'
import type { Vec2 } from '@/utils/vect'
import { computed } from 'vue'

const props = defineProps<{
  tag: string
}>()

const areaTags = computed(() => {
  const points: Vec2[] = []
  let sharedTags: Set<string> = new Set()
  let howManyDevices = 0
  let first = true

  for (const device of currentDevices.value) {
    const tags = taggedDevices.value.get(device.id)
    if (tags?.has(props.tag)) {
      points.push(...deviceRectToPointsWithPadding(device, 16))
      sharedTags = intersectionSets(first ? tags : sharedTags, tags)
      howManyDevices++
      first = false
    }
  }

  if (points.length === 0) {
    return { path: '', center: { x: 0, y: 0 }, sharedTags: [] }
  }

  const hullPoints = convexHull(points)

  return {
    path: generatePathConvexHull(hullPoints),
    center: polygonCentroid(hullPoints),
    sharedTags: sharedTags,
    displayTags: howManyDevices > 1,
  }
})
</script>

<template>
  <svg class="tags-svg">
    <path
      :d="areaTags.path"
      :fill="tagscolors[tag]"
      :stroke="tagsStrokecolors[tag]"
      stroke-width="4"
    ></path>
  </svg>

  <div
    class="tags-tag"
    :style="{ transform: `translate3d(${areaTags.center.x}px,${areaTags.center.y}px,0)` }"
  >
    <div v-if="areaTags.displayTags" class="flex gap-1" style="transform: translate(-50%, 25%)">
      <span
        v-for="tag in areaTags.sharedTags"
        :key="tag"
        class="rounded-xl p-1"
        :style="{ background: tagsStrokecolors[tag] }"
        >{{ tag }}</span
      >
    </div>
  </div>
</template>

<style>
.tags-svg {
  position: absolute;
  overflow: visible;
}

.tags-tag {
  position: absolute;
}
</style>
