import { useEventListener } from '@vueuse/core'
import { contextMenu, currentMode, selectedDevices, useCanvas, visibleDevices } from './use-Canvas'
import { ref, useTemplateRef } from 'vue'
import { Rect } from '@/utils/rect'
import { scale, screenViewPort } from './use-Pan-Zoom-Canvas'
import { useRAF } from './use-Raf'

const groupRect = Rect.fromLTWH(0, 0, 0, 0)

export const useGroupSelect = () => {
  const { skipOnUIElement, startCanvasDrag, endCanvasDrag } = useCanvas()

  const { scheduleRAF } = useRAF()

  const showGroupRect = ref(false)

  let x = 0
  let y = 0

  let offsetX = 0
  let offsetY = 0

  const rectGroupSelecting = useTemplateRef<SVGElement>('rectGroupSelecting')

  const updateDOM = () => {
    if (!rectGroupSelecting.value) return

    const scaledOffsetX = offsetX / scale.value
    const scaledOffsetY = offsetY / scale.value
    const scaledX = x / scale.value
    const scaledY = y / scale.value

    const xRect = Math.min(scaledOffsetX, scaledX)
    const yRect = Math.min(scaledOffsetY, scaledY)
    const widthRect = Math.abs(scaledX - scaledOffsetX)
    const heightRect = Math.abs(scaledY - scaledOffsetY)

    groupRect.x = xRect + screenViewPort.x
    groupRect.y = yRect + screenViewPort.y
    groupRect.width = widthRect
    groupRect.height = heightRect

    selectedDevices.value = new Set(
      visibleDevices.value
        .filter((item) => {
          return Rect.isRectVisible(item.rect, groupRect)
        })
        .map((item) => item.id),
    )

    rectGroupSelecting.value.setAttribute('x', `${groupRect.x}`)
    rectGroupSelecting.value.setAttribute('y', `${groupRect.y}`)
    rectGroupSelecting.value.setAttribute('width', `${groupRect.width}`)
    rectGroupSelecting.value.setAttribute('height', `${groupRect.height}`)
    rectGroupSelecting.value.setAttribute('stroke-width', `${2 / scale.value}`)
  }

  const startDrag = (event: PointerEvent) => {
    if (skipOnUIElement(event.target)) return

    if (currentMode.value == 'panning') return

    if (event.button !== 0) return

    showGroupRect.value = true

    startCanvasDrag()

    offsetX = event.clientX
    offsetY = event.clientY
  }
  const updateDrag = (event: PointerEvent) => {
    if (contextMenu.value || !showGroupRect.value) return

    if (currentMode.value == 'selecting') {
      if (!rectGroupSelecting.value) return

      scheduleRAF(() => {
        x = event.clientX
        y = event.clientY

        updateDOM()
      })
    }
  }
  const endDrag = () => {
    showGroupRect.value = false

    endCanvasDrag()
  }

  useEventListener(document, 'pointerdown', startDrag)
  useEventListener(document, 'pointermove', updateDrag)
  useEventListener(document, 'pointerup', endDrag)

  return { showGroupRect }
}
