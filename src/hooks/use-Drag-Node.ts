import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, type Ref } from 'vue'
import { contextMenu, currentLinks, selectedDevices, useCanvas } from './use-Canvas'
import { useRAF } from './use-Raf'
import { scale, screenViewPort } from './use-Pan-Zoom-Canvas'

import type { Vec2 } from '@/utils/vect'
import { useGlobalManager, type NodeInstance } from './use-Global-Manager'

type DragState = 'linking' | 'dragging' | null

export const isLinking = ref(false)

export const isNodeActive = ref(false)

export const useDragNode = (nodeId: string) => {
  const nodeRef = useTemplateRef<HTMLDivElement>('nodeRef')
  const pathAddingLinkRef = useTemplateRef<HTMLDivElement>('pathAddingLinkRef')

  const { scheduleRAF } = useRAF()

  const { updateNodePosition, updateNodeDimensions, addLink, rightClickOnCanvas } = useCanvas()

  const { globalDragUpdate, registerNode, unregisterNode } = useGlobalManager()

  const isActive = ref(false)

  const currentDragState: Ref<DragState> = ref(null)

  const isInGroupSelected = computed(() => selectedDevices.value.has(nodeId))

  const shouldNotifyLinks = computed(
    () =>
      currentLinks.value.find(
        (link) => link.sourceNodeId == nodeId || link.targetNodeId == nodeId,
      ) !== undefined,
  )

  const shouldNotifyGroup = computed(
    () => isInGroupSelected.value && selectedDevices.value.size >= 2,
  )

  const isAddingLink = computed(() => currentDragState.value === 'linking')

  const shouldNotifyOthers = computed(
    () =>
      (shouldNotifyGroup.value || shouldNotifyLinks.value) && currentDragState.value == 'dragging',
  )

  let offsetX = 0

  let offsetY = 0

  let x = 0

  let y = 0

  let linkingStartX = 0

  let linkingStartY = 0

  const updateDOM = () => {
    if (currentDragState.value == 'linking') {
      if (pathAddingLinkRef.value) {
        pathAddingLinkRef.value.setAttribute(
          'd',
          `M ${linkingStartX} ${linkingStartY} L ${linkingStartX + x} ${linkingStartY + y}`,
        )
      }
    } else if (currentDragState.value == 'dragging') {
      if (nodeRef.value) {
        nodeRef.value.style.transform = `translate3d(${x}px,${y}px,0)`
      }
    }
  }

  const addingLink = (event: PointerEvent) => {
    if (event.target == null) return false
    if (event.target instanceof SVGElement && event.target.closest('.device-plug')) {
      return true
    }

    return false
  }

  const shouldAddLink = (event: PointerEvent) => {
    if (event.target == null) return ''

    if (event.target instanceof HTMLElement) {
      return event.target.closest<HTMLElement>('.device-canvas')?.dataset.id
    }

    if (event.target instanceof SVGElement) {
      return event.target.closest<SVGElement>('.device-canvas')?.dataset.id
    }

    return ''
  }

  const resetPositionDOM = () => {
    if (nodeRef.value) {
      nodeRef.value.style.transform = 'none'
    }
  }

  const resetLinkingDOM = () => {
    if (pathAddingLinkRef.value) {
      pathAddingLinkRef.value.setAttribute('d', '')
    }
  }

  const resetPositions = () => {
    x = 0
    y = 0
    linkingStartX = 0
    linkingStartY = 0
    offsetX = 0
    offsetY = 0
  }

  const resetStates = () => {
    currentDragState.value = null
    isLinking.value = false
    isActive.value = false
  }

  const startDrag = (event: PointerEvent) => {
    if (event.button !== 0) return

    isActive.value = true
    isNodeActive.value = true

    offsetX = event.clientX / scale.value - x
    offsetY = event.clientY / scale.value - y

    if (addingLink(event)) {
      currentDragState.value = 'linking'
      isLinking.value = true
      linkingStartX = offsetX + screenViewPort.x
      linkingStartY = offsetY + screenViewPort.y
    } else {
      currentDragState.value = 'dragging'
    }
  }

  const updateDrag = (event: PointerEvent) => {
    if (contextMenu.value || currentDragState.value == null) return

    scheduleRAF(() => {
      x = event.clientX / scale.value - offsetX
      y = event.clientY / scale.value - offsetY

      updateDOM()

      if (shouldNotifyOthers.value) {
        globalDragUpdate({ isDragging: true, position: { x, y }, source: nodeId })
      }
    })
  }
  const endDrag = (event: PointerEvent) => {
    isNodeActive.value = false

    if (currentDragState.value == 'linking') {
      const nodeTarget = shouldAddLink(event)
      if (nodeTarget && nodeTarget != nodeId) {
        addLink(nodeId, nodeTarget)
      }
    }

    if (currentDragState.value == 'dragging') {
      if (shouldNotifyOthers.value) {
        globalDragUpdate({
          isDragging: false,
          position: { x, y },
          source: nodeId,
        })
      }
      resetPositionDOM()
      resetStates()
      scheduleRAF(() => {
        updateNodePosition(nodeId, { x, y })
        resetPositions()
      })
    } else {
      resetLinkingDOM()
      resetStates()
      scheduleRAF(() => {
        resetPositions()
      })
    }
  }

  useEventListener(nodeRef, 'pointerdown', startDrag)
  useEventListener(document, 'pointermove', updateDrag)
  useEventListener(document, 'pointerup', endDrag)

  useResizeObserver(nodeRef, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect

    updateNodeDimensions(nodeId, width, height)
  })

  const setContextMenu = (event: PointerEvent) => {
    event.preventDefault()

    rightClickOnCanvas(nodeId, event.clientX, event.clientY, 'nodeDevice', {})
  }

  useEventListener(nodeRef, 'contextmenu', setContextMenu, { passive: false })

  const nodeInstance: NodeInstance = {
    id: nodeId,
    element: null,
    updateDrag(position: Vec2) {
      x = position.x
      y = position.y
      if (nodeInstance.element) {
        nodeInstance.element.style.transform = `translate3d(${x}px,${y}px,0)`
      }
    },
    endDrag(position: Vec2) {
      if (nodeInstance.element) {
        nodeInstance.element.style.transform = 'none'
      }
      updateNodePosition(nodeId, position)
      resetPositions()
    },
  }

  onMounted(() => {
    nodeInstance.element = nodeRef.value
    registerNode(nodeInstance)
  })

  onUnmounted(() => {
    unregisterNode(nodeId)
  })

  return { isActive, isAddingLink, isInGroupSelected }
}
