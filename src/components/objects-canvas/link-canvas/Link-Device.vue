<script setup lang="ts">
import { isNodeActive } from '@/hooks/use-Drag-Node'
import type { Link } from '@/models/link'
import { generatePath, interfacesLine } from '@/utils/link'
import { Vec, type Vec2 } from '@/utils/vect'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, type ComputedRef } from 'vue'
import { useColorMode, useEventListener } from '@vueuse/core'
import { useCanvas } from '@/hooks/use-Canvas'
import { useGlobalManager, type LinkInstance } from '@/hooks/use-Global-Manager'

const props = defineProps<{
  link: Link
}>()

const { rightClickOnCanvas } = useCanvas()

const { registerLink, unregisterLink } = useGlobalManager()

const srcLinkInterfaceRef = useTemplateRef<HTMLElement>('srcLinkInterfaceRef')
const dstLinkInterfaceRef = useTemplateRef<HTMLElement>('dstLinkInterfaceRef')
const linkLabelRef = useTemplateRef<HTMLElement>('linkLabelRef')
const linkPathRef = useTemplateRef<SVGElement>('linkPathRef')

const melinkRef = useTemplateRef<HTMLElement>('melinkRef')

const path = computed(() =>
  generatePath(props.link.type, props.link.sourcePos, props.link.targetPos),
)

const srcInterfaceSize = ref({ width: 0, height: 0 })

const dstInterfaceSize = ref({ width: 0, height: 0 })

const labelSize = ref({ width: 0, height: 0 })

const mode = useColorMode()

const interfaces: ComputedRef<{ srcInterface: Vec2; dstInterface: Vec2 }> = computed(
  (oldInterfaces) => {
    const newInterfaces = interfacesLine(
      props.link.type,
      props.link.sourcePos,
      props.link.targetPos,
      srcInterfaceSize.value,
      dstInterfaceSize.value,
    )

    if (
      oldInterfaces &&
      Vec.equals(oldInterfaces?.srcInterface, newInterfaces[0]) &&
      Vec.equals(oldInterfaces?.dstInterface, newInterfaces[1])
    ) {
      return oldInterfaces
    }

    return { srcInterface: newInterfaces[0], dstInterface: newInterfaces[1] }
  },
)

const srcInterfacePos: ComputedRef<Vec2> = computed((oldSrcPos) => {
  const newSrcPos = {
    x: interfaces.value.srcInterface.x - srcInterfaceSize.value.width / 2,
    y: interfaces.value.srcInterface.y - srcInterfaceSize.value.height / 2,
  }

  if (oldSrcPos && Vec.equals(oldSrcPos, newSrcPos)) {
    return oldSrcPos
  }

  return newSrcPos
})

const dstInterfacePos: ComputedRef<Vec2> = computed((oldSrcPos) => {
  const newSrcPos = {
    x: interfaces.value.dstInterface.x - dstInterfaceSize.value.width / 2,
    y: interfaces.value.dstInterface.y - dstInterfaceSize.value.height / 2,
  }

  if (oldSrcPos && Vec.equals(oldSrcPos, newSrcPos)) {
    return oldSrcPos
  }

  return newSrcPos
})

const labelPos: ComputedRef<Vec2> = computed((oldLabel) => {
  const midPoint = {
    x: (props.link.sourcePos.x + props.link.targetPos.x) / 2,
    y: (props.link.sourcePos.y + props.link.targetPos.y) / 2,
  }

  const newLabel = {
    x: midPoint.x - labelSize.value.width / 2,
    y: midPoint.y - labelSize.value.height / 2,
  }
  if (oldLabel && Vec.equals(oldLabel, newLabel)) {
    return oldLabel
  }

  return newLabel
})

const updatePATH = (src: Vec2, dst: Vec2) => {

  const sourcePos = Vec.add(props.link.sourcePos, src)
  const targetPos = Vec.add(props.link.targetPos, dst)

  const interfaces = interfacesLine(
    props.link.type,
    sourcePos,
    targetPos,
    srcInterfaceSize.value,
    dstInterfaceSize.value,
  )

  if (linkPathRef.value) {
    linkPathRef.value.setAttribute('d', generatePath(props.link.type, sourcePos, targetPos))
  }

  if (srcLinkInterfaceRef.value) {
    const newSrcPos = {
      x: interfaces[0].x - srcInterfaceSize.value.width / 2,
      y: interfaces[0].y - srcInterfaceSize.value.height / 2,
    }

    srcLinkInterfaceRef.value.style.transform = `translate3d(${newSrcPos.x}px,${newSrcPos.y}px,0)`
  }

  if (dstLinkInterfaceRef.value) {
    const newDstPos = {
      x: interfaces[1].x - dstInterfaceSize.value.width / 2,
      y: interfaces[1].y - dstInterfaceSize.value.height / 2,
    }

    dstLinkInterfaceRef.value.style.transform = `translate3d(${newDstPos.x}px,${newDstPos.y}px,0)`
  }

  if (linkLabelRef.value) {
    const midPoint = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2,
    }

    const newLabel = {
      x: midPoint.x - labelSize.value.width / 2,
      y: midPoint.y - labelSize.value.height / 2,
    }

    if (linkLabelRef.value) {
      linkLabelRef.value.style.transform = `translate3d(${newLabel.x}px,${newLabel.y}px,0)`
    }
  }
}

onMounted(() => {
  if (srcLinkInterfaceRef.value) {
    srcInterfaceSize.value = {
      width: srcLinkInterfaceRef.value.offsetWidth,
      height: srcLinkInterfaceRef.value.offsetHeight,
    }
  }

  if (dstLinkInterfaceRef.value) {
    dstInterfaceSize.value = {
      width: dstLinkInterfaceRef.value.offsetWidth,
      height: dstLinkInterfaceRef.value.offsetHeight,
    }
  }

  if (linkLabelRef.value) {
    labelSize.value = {
      width: linkLabelRef.value.offsetWidth,
      height: linkLabelRef.value.offsetHeight,
    }
  }

  const linkInstance: LinkInstance = {
    elements: {
      dstInterface: dstLinkInterfaceRef.value,
      label: linkLabelRef.value,
      path: linkPathRef.value,
      srcInterface: srcLinkInterfaceRef.value,
    },
    sourceNodeId: props.link.sourceNodeId,
    targetNodeId: props.link.targetNodeId,
    id: props.link.id,
    updateDrag: updatePATH,
  }

  registerLink(linkInstance)
})

onUnmounted(() => {
  unregisterLink(props.link.id)
})

const setContextMenu = (event: PointerEvent) => {
  event.preventDefault()

  rightClickOnCanvas(props.link.id, event.clientX, event.clientY, 'link', {
    typeLink: props.link.type,
  })
}

useEventListener(melinkRef, 'contextmenu', setContextMenu, { passive: false })
</script>

<template>
  <div ref="melinkRef" class="meLink ui-element" :class="{ 'no-pointer': isNodeActive, 'dark': mode === 'dark' }">
    <svg class="meLinkCanvas">
      <path :d="path" ref="linkPathRef" class="linkPath" fill="none"></path>
    </svg>
    <div ref="srcLinkInterfaceRef" class="linkInterface" :style="{
      transform: `translate3d(${srcInterfacePos.x}px, ${srcInterfacePos.y}px,0)`,
      zIndex: link.indexLink + 1,
    }">
      <span class="linkInterfaceName">{{ props.link.sourceInterfaceName }}</span>
    </div>

    <div ref="dstLinkInterfaceRef" class="linkInterface" :style="{
      transform: `translate3d(${dstInterfacePos.x}px, ${dstInterfacePos.y}px,0)`,
      zIndex: link.indexLink + 1,
    }">
      <span class="linkInterfaceName">{{ props.link.targetInterfaceName }}</span>
    </div>

    <div ref="linkLabelRef" class="linkLabel" :style="{
      transform: `translate3d(${labelPos.x}px, ${labelPos.y}px,0)`,
      zIndex: link.totalLinks + 1,
    }">
      <span class="linkLabelName">{{ props.link.labelName }}</span>
    </div>
  </div>
</template>

<style scoped>
.meLink {
  cursor: pointer;
}

.meLinkCanvas {
  position: absolute;
  overflow: visible;
}

.linkInterface {
  position: absolute;
  background: rgb(227, 227, 255);
  border-radius: 10px;
  font-size: 12px;
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
  border: 3px solid #1a1a85;
  padding: 2px 6px;
  display: flex;
  align-items: center;
}

.linkInterfaceName {
  display: inline-block;
  font-weight: 600;
}

.linkLabelName {
  display: inline-block;
  font-weight: 600;
  font-size: 12px;
  color: white;
}


.meLink.dark .linkLabel {
  background: var(--color-slate-600);
  border-color: var(--color-slate-800);
}

.meLink.dark .linkPath {
  stroke: var(--color-slate-400);
}

.meLink.dark .linkInterface {
  background: var(--color-slate-300);
  border-color: var(--color-slate-800);

}

.linkLabel {
  position: absolute;
  white-space: nowrap;
  background: rgb(48, 48, 155);
  border-radius: 10px;
  border: 3px solid rgb(18, 18, 102);
  padding: 2px 16px;
  display: flex;
  align-items: center;
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}

.meLink:hover .linkLabel {
  z-index: 101 !important;
}

.meLink:hover .linkLabel,
.meLink.isActive .linkLabel {
  background: lime;
  border-color: rgb(0, 155, 0);
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
  z-index: 100 !important;
}

.meLink:hover .linkInterface,
.meLink.isActive .linkInterface {
  background: lime;
  border-color: rgb(0, 155, 0);
  transition:
    background 0.3s ease,
    border-color 0.3s ease;

  z-index: 100 !important;
}

.linkPath {
  stroke-width: 2;
  stroke: rgb(26, 26, 118);
  transition: stroke 0.3s ease;
}

.meLink:hover .linkPath,
.meLink.active .linkPath {
  transition: stroke 0.3s ease;
  stroke: rgb(0, 155, 0);
}

.no-pointer {
  pointer-events: none;
}
</style>
