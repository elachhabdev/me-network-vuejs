import type { Vec2 } from '@/utils/vect'
import { selectedDevices } from './use-Canvas'
import { useRAF } from './use-Raf'

export type CurrentDraggingState = {
  isDragging: boolean
  position: Vec2
  source: string
}

export interface NodeInstance {
  id: string
  element: HTMLElement | null
  updateDrag: (position: Vec2) => void
  endDrag: (position: Vec2) => void
}

export interface LinkInstance {
  id: string
  sourceNodeId: string
  targetNodeId: string
  elements: {
    path: SVGElement | null
    srcInterface: HTMLElement | null
    dstInterface: HTMLElement | null
    label: HTMLElement | null
  }
  updateDrag: (src: Vec2, dst: Vec2) => void
}

const nodeRegistry = new Map<string, NodeInstance>()
const linkRegistry = new Map<string, LinkInstance>()
const nodeToLinksMap = new Map<string, Set<string>>()

export const useGlobalManager = () => {
  const { scheduleRAF } = useRAF()

  const registerNode = (nodeInstance: NodeInstance) => {
    nodeRegistry.set(nodeInstance.id, nodeInstance)

    if (!nodeToLinksMap.has(nodeInstance.id)) {
      nodeToLinksMap.set(nodeInstance.id, new Set())
    }
  }

  const registerLink = (linkInstance: LinkInstance) => {
    linkRegistry.set(linkInstance.id, linkInstance)

    const sourceLinks = nodeToLinksMap.get(linkInstance.sourceNodeId) || new Set()

    sourceLinks.add(linkInstance.id)

    nodeToLinksMap.set(linkInstance.sourceNodeId, sourceLinks)

    const targetLinks = nodeToLinksMap.get(linkInstance.targetNodeId) || new Set()

    targetLinks.add(linkInstance.id)

    nodeToLinksMap.set(linkInstance.targetNodeId, targetLinks)
  }

  const unregisterNode = (nodeId: string) => {
    nodeRegistry.delete(nodeId)
  }

  const unregisterLink = (linkId: string) => {
    const link = linkRegistry.get(linkId)

    if (link) {
      nodeToLinksMap.get(link.sourceNodeId)?.delete(linkId)
      nodeToLinksMap.get(link.targetNodeId)?.delete(linkId)
    }

    linkRegistry.delete(linkId)
  }

  const getAffectedLinks = (sourceNodeId: string) => {
    const affectedLinkIds: string[] = []

    const directLinks = nodeToLinksMap.get(sourceNodeId)
    if (directLinks) {
      affectedLinkIds.push(...directLinks)
    }

    if (selectedDevices.value.has(sourceNodeId) && selectedDevices.value.size >= 2) {
      selectedDevices.value.forEach((nodeId) => {
        const nodeLinks = nodeToLinksMap.get(nodeId)
        if (nodeLinks) {
          affectedLinkIds.push(...nodeLinks)
        }
      })
    }

    return new Set(affectedLinkIds)
  }

  const globalDragUpdate = (currentDraggingState: CurrentDraggingState) => {
    if (currentDraggingState.isDragging) {
      const affectedNodes = selectedDevices.value
      const affectedLinks = getAffectedLinks(currentDraggingState.source)

      scheduleRAF(() => {
        affectedNodes.forEach((nodeId: string) => {
          const nodeInstance = nodeRegistry.get(nodeId)
          if (nodeInstance && nodeId !== currentDraggingState.source) {
            if (
              selectedDevices.value.has(nodeId) &&
              selectedDevices.value.has(currentDraggingState.source)
            ) {
              nodeInstance.updateDrag(currentDraggingState.position)
            }
          }
        })

        affectedLinks.forEach((linkId: string) => {
          const linkInstance = linkRegistry.get(linkId)
          let src = { x: 0, y: 0 }
          let dst = { x: 0, y: 0 }

          if (linkInstance) {
            let needsupdate = false

            const isNodeDraggedInGroup =
              selectedDevices.value.has(currentDraggingState.source) &&
              selectedDevices.value.size >= 2

            const isLinkSourceInGroup =
              isNodeDraggedInGroup && selectedDevices.value.has(linkInstance.sourceNodeId)

            const isLinkTargetInGroup =
              isNodeDraggedInGroup && selectedDevices.value.has(linkInstance.targetNodeId)

            if (currentDraggingState.source == linkInstance.sourceNodeId || isLinkSourceInGroup) {
              src = currentDraggingState.position
              needsupdate = true
            }

            if (currentDraggingState.source == linkInstance.targetNodeId || isLinkTargetInGroup) {
              dst = currentDraggingState.position
              needsupdate = true
            }

            if (needsupdate) {
              linkInstance.updateDrag(src, dst)
            }
          }
        })
      })
    } else {
      scheduleRAF(() => {
        const affectedNodes = selectedDevices.value

        affectedNodes.forEach((nodeId: string) => {
          const nodeInstance = nodeRegistry.get(nodeId)
          if (nodeInstance && nodeId !== currentDraggingState.source) {
            if (
              selectedDevices.value.has(nodeId) &&
              selectedDevices.value.has(currentDraggingState.source)
            ) {
              nodeInstance.endDrag(currentDraggingState.position)
            }
          }
        })
      })
    }
  }

  return { globalDragUpdate, registerLink, registerNode, unregisterLink, unregisterNode }
}
