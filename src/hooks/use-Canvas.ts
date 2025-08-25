import type { Link, typeLink } from '@/models/link'
import type { NodeDevice, NodeText } from '@/models/node'
import { pathParallel } from '@/utils/link'
import { Rect } from '@/utils/rect'
import { maxLinks, nodeDeviceSize } from '@/utils/settings'
import { updateDualList } from '@/utils/utils'
import { Vec, type Vec2 } from '@/utils/vect'
import { shallowRef, type Ref, type ShallowRef, ref } from 'vue'

export type CanvasMode = 'selecting' | 'panning'

export type ActionContextMenu = null | 'canvas' | 'nodeDevice' | 'link'

export type ContextMenu = {
  x: number
  y: number
  actionContextMenu: ActionContextMenu
  id: string
  options: { typeLink?: typeLink }
}

export type TagDevice = {
  tagId: string
  color: string
}

export const currentMode: Ref<CanvasMode> = ref('selecting')

export const currentDevices: ShallowRef<NodeDevice[]> = shallowRef([])
export const visibleDevices: ShallowRef<NodeDevice[]> = shallowRef([])
export const currentTexts: ShallowRef<NodeText[]> = shallowRef([])
export const visibleTexts: ShallowRef<NodeText[]> = shallowRef([])

export const currentLinks: ShallowRef<Link[]> = shallowRef([])
export const visibleLinks: ShallowRef<Link[]> = shallowRef([])

export const selectedDevices: ShallowRef<Set<string>> = shallowRef(new Set())
export const contextMenu: ShallowRef<ContextMenu | null> = shallowRef(null)

export const taggedDevices: Ref<Map<string, Set<string>>> = ref(new Map())

export const useCanvas = () => {
  const skipOnUIElement = (target: EventTarget | null) => {
    if (target == null) return true

    if (
      (target instanceof HTMLElement || target instanceof SVGElement) &&
      target.closest('.ui-element')
    ) {
      return true
    }

    return false
  }

  const setSelectionMode = (mode: 'selecting' | 'panning') => {
    currentMode.value = mode
  }

  const resetGroupSelected = () => {
    if (selectedDevices.value.size > 0) {
      selectedDevices.value = new Set()
    }
  }

  const rightClickOnCanvas = (
    id: string,
    x: number,
    y: number,
    actionContextMenu: ActionContextMenu,
    options: { typeLink?: typeLink },
  ) => {
    contextMenu.value = { id, x, y, actionContextMenu, options }

    resetGroupSelected()
  }

  const startCanvasDrag = () => {
    contextMenu.value = null

    resetGroupSelected()
  }

  const endCanvasDrag = () => {}

  const addDevice = (device: NodeDevice) => {
    currentDevices.value = [...currentDevices.value, device]
    visibleDevices.value = [...visibleDevices.value, device]
  }

  const updateNodePosition = (nodeId: string, position: Vec2) => {
    updateDualList([currentDevices, visibleDevices], (device) => {
      if (device.id === nodeId) {
        return {
          ...device,
          rect: device.rect.translate(position.x, position.y),
        }
      } else {
        return device
      }
    })

    currentLinks.value = currentLinks.value.map((link) => {
      if (link.sourceNodeId == nodeId) {
        return {
          ...link,
          sourcePos: Vec.add(link.sourcePos, position),
          sourceRect: link.sourceRect.translate(position.x, position.y),
        }
      } else if (link.targetNodeId == nodeId) {
        return {
          ...link,
          targetPos: Vec.add(link.targetPos, position),
          targetRect: link.targetRect.translate(position.x, position.y),
        }
      } else {
        return link
      }
    })
  }

  const updateNodeDimensions = (nodeId: string, width: number, height: number) => {
    updateDualList([currentDevices, visibleDevices], (device) => {
      if (device.id === nodeId) {
        return {
          ...device,
          isCreated: true,
          rect: !device.isCreated
            ? Rect.fromLTWH(
                device.rect.x - nodeDeviceSize.width / 2,
                device.rect.y - nodeDeviceSize.height / 2,
                width,
                height,
              )
            : Rect.fromLTWH(device.rect.x, device.rect.y, width, height),
        }
      } else {
        return device
      }
    })
  }

  const addLink = (source: string, target: string) => {
    const sameLinks = currentLinks.value.filter(
      (link) =>
        (link.sourceNodeId === source && link.targetNodeId === target) ||
        (link.sourceNodeId === target && link.targetNodeId === source),
    )
    const totalLinks = sameLinks.length

    if (totalLinks >= maxLinks) return

    const linkId = `l-${source}-${target}-${currentLinks.value.length + 1}`

    const intName = `eth${Math.floor(totalLinks / 4)}/${totalLinks % 4}`

    const sourceNode = currentDevices.value.find((device) => device.id == source)

    const targetNode = currentDevices.value.find((device) => device.id == target)

    if (!sourceNode || !targetNode) return

    const currentLinkSource = sameLinks.length > 0 ? sameLinks[0].sourceNodeId : source
    const currentLinkTarget = sameLinks.length > 0 ? sameLinks[0].targetNodeId : target

    const currentLinkSourceRect = sameLinks.length > 0 ? sameLinks[0].sourceRect : sourceNode.rect
    const currentLinkTargetRect = sameLinks.length > 0 ? sameLinks[0].targetRect : targetNode.rect

    const newLink: Link = {
      id: linkId,
      indexLink: totalLinks,
      totalLinks: totalLinks + 1,
      labelName: `label ${linkId}`,
      type: 'straight',
      sourceInterfaceName: intName,
      sourceNodeId: currentLinkSource,
      targetNodeId: currentLinkTarget,
      targetInterfaceName: intName,
      sourceRect: currentLinkSourceRect,
      targetRect: currentLinkTargetRect,
      sourcePos: { x: currentLinkSourceRect.x, y: currentLinkSourceRect.y },
      targetPos: { x: currentLinkTargetRect.x, y: currentLinkTargetRect.y },
    }

    const updateNewLink = pathParallel(newLink)

    currentLinks.value = [...currentLinks.value, updateNewLink]

    if (sameLinks.length > 0) {
      currentLinks.value = currentLinks.value.map((link) => {
        if (
          link.id != newLink.id &&
          link.sourceNodeId === currentLinkSource &&
          link.targetNodeId === currentLinkTarget
        ) {
          const updatedExistingLink = pathParallel({ ...link, totalLinks: totalLinks + 1 })
          return updatedExistingLink
        } else {
          return link
        }
      })
    }
  }

  const updateLinkType = (linkId: string, typeLink: typeLink) => {
    currentLinks.value = currentLinks.value.map((link) => {
      if (link.id === linkId) {
        return { ...link, type: typeLink }
      }

      return link
    })
  }

  const updateDeviceTags = (tagIds: Set<string>, nodeId: string) => {
    taggedDevices.value.set(nodeId, tagIds)
  }

  return {
    skipOnUIElement,
    setSelectionMode,
    rightClickOnCanvas,
    startCanvasDrag,
    endCanvasDrag,
    addDevice,
    updateNodePosition,
    updateNodeDimensions,
    addLink,
    resetGroupSelected,
    updateLinkType,
    updateDeviceTags,
  }
}
