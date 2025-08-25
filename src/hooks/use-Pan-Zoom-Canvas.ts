import { clamp, useEventListener, useResizeObserver } from '@vueuse/core'
import { useTemplateRef, ref, type Ref } from 'vue'
import { useRAF } from './use-Raf'
import { worldOrigin, worldScreen } from '@/utils/settings'
import { contextMenu, currentDevices, currentMode, useCanvas, visibleDevices } from './use-Canvas'
import { Rect } from '@/utils/rect'

export const screenViewPort: Rect = Rect.fromLTWH(0, 0, worldScreen.width, worldScreen.height)

export const scale: Ref<number> = ref(1)

export const usePanZoomCanvas = () => {
  const { scheduleRAF } = useRAF()
  const {
    skipOnUIElement,
    rightClickOnCanvas,
    startCanvasDrag,
    endCanvasDrag,
    resetGroupSelected,
  } = useCanvas()

  let x = 0
  let y = 0

  let offsetX = 0
  let offsetY = 0

  let isDragging = false
  let firstMount = true

  let prevScale = 1

  let screen: { width: number; height: number } = { width: 0, height: 0 }
  let screenOrigin: { x: number; y: number } | null = null

  const meCanvasRef = useTemplateRef<HTMLDivElement>('meCanvas')
  const gridViewBoxRef = useTemplateRef<SVGElement>('gridViewBox')
  const gridRectRef = useTemplateRef<SVGElement>('gridRectRef')
  const meCanvasWrapperRef = useTemplateRef<HTMLDivElement>('meCanvasWrapper')

  const centerCanvas = (origin: { x: number; y: number }) => {
    x = origin.x - worldOrigin.x
    y = origin.y - worldOrigin.y

    updateDOM()
  }

  const clampedToCanvas = (newScreen: { width: number; height: number }) => {
    const panLimitX = worldScreen.width * scale.value - newScreen.width
    const panLimitY = worldScreen.height * scale.value - newScreen.height

    x = clamp(x, -panLimitX, 0)
    y = clamp(y, -panLimitY, 0)

    updateDOM()
  }

  const updateDOM = () => {
    if (!meCanvasRef.value || !gridViewBoxRef.value || !gridRectRef.value) return

    const scaledX = -x / scale.value
    const scaledY = -y / scale.value

    screenViewPort.x = scaledX
    screenViewPort.y = scaledY
    screenViewPort.width = screen.width / scale.value
    screenViewPort.height = screen.height / scale.value

    meCanvasRef.value.style.transform = `translate3d(${x}px, ${y}px, 0) scale3d(${scale.value},${scale.value},1)`
    gridViewBoxRef.value.setAttribute(
      'viewBox',
      `${screenViewPort.x} ${screenViewPort.y} ${screenViewPort.width} ${screenViewPort.height}`,
    )
    gridRectRef.value.setAttribute('x', `${scaledX}`)
    gridRectRef.value.setAttribute('y', `${scaledY}`)

    //spatial grid add ovear head for max 500 better filter

    const newVisibleDevices = currentDevices.value.filter((item) => {
      return Rect.isRectVisible(item.rect, screenViewPort)
    })

    visibleDevices.value = newVisibleDevices
  }

  const startDrag = (event: PointerEvent) => {
    if (skipOnUIElement(event.target)) return

    if (currentMode.value == 'selecting') return

    if (event.button !== 0) return

    startCanvasDrag()

    isDragging = true

    offsetX = event.clientX - x
    offsetY = event.clientY - y
  }

  const updateDrag = (event: PointerEvent) => {
    if (!isDragging || contextMenu.value) return

    if (currentMode.value == 'panning') {
      scheduleRAF(() => {
        if (!meCanvasRef.value || !gridViewBoxRef.value || !gridRectRef.value) return

        const panLimitX = worldScreen.width * scale.value - screen.width
        const panLimitY = worldScreen.height * scale.value - screen.height

        x = clamp(event.clientX - offsetX, -panLimitX, 0)
        y = clamp(event.clientY - offsetY, -panLimitY, 0)

        updateDOM()
      })
    }
  }

  const endDrag = () => {
    isDragging = false
    endCanvasDrag()
  }

  const adjustZoomCenter = (centerPoint: { x: number; y: number } | null = null) => {
    resetGroupSelected()

    centerPoint ??= {
      x: screen.width / 2,
      y: screen.height / 2,
    }

    const prev = {
      x: x,
      y: y,
    }

    const scaleRatio = scale.value / prevScale

    const newX = centerPoint.x - (centerPoint.x - prev.x) * scaleRatio
    const newY = centerPoint.y - (centerPoint.y - prev.y) * scaleRatio

    const panLimitX = worldScreen.width * scale.value - screen.width
    const panLimitY = worldScreen.height * scale.value - screen.height

    x = clamp(newX, -panLimitX, 0)
    y = clamp(newY, -panLimitY, 0)

    updateDOM()
  }

  const zoomIn = () => {
    const scaleValueNew = clamp(scale.value + 0.25, 0.5, 2)

    if (scaleValueNew !== scale.value) {
      scheduleRAF(() => {
        prevScale = scale.value
        scale.value = scaleValueNew

        adjustZoomCenter()
      })
    }
  }

  const zoomOut = () => {
    const scaleValueNew = clamp(scale.value - 0.25, 0.5, 2)
    if (scaleValueNew !== scale.value) {
      scheduleRAF(() => {
        prevScale = scale.value
        scale.value = scaleValueNew

        adjustZoomCenter()
      })
    }
  }

  const zoomFit = () => {
    //disable pan allow select

    const scaleX = screen.width / worldScreen.width
    const scaleY = screen.height / worldScreen.height

    const newScale = Math.min(scaleX, scaleY, 1)
    prevScale = newScale

    const centerPos = calculateCenterPosition(newScale)

    scale.value = newScale

    x = centerPos.x
    y = centerPos.y

    resetGroupSelected()

    updateDOM()
  }

  const zoomReset = () => {
    const centerPos = calculateCenterPosition(1)
    prevScale = 1
    scale.value = 1

    x = centerPos.x
    y = centerPos.y

    resetGroupSelected()

    updateDOM()
  }

  const reCenter = () => {
    const centerPos = calculateCenterPosition(scale.value)

    x = centerPos.x
    y = centerPos.y

    updateDOM()
  }

  const zoomByWheel = (event: WheelEvent) => {
    event.preventDefault()

    if (event.ctrlKey) {
      const scaleValueNew = clamp(scale.value - (event.deltaY > 0 ? 0.25 : -0.25), 0.5, 2)
      if (scaleValueNew !== scale.value) {
        scheduleRAF(() => {
          prevScale = scale.value
          scale.value = scaleValueNew

          adjustZoomCenter()
        })
      }
    }
  }

  const calculateCenterPosition = (scale: number): { x: number; y: number } => {
    const scaledWorldWidth = worldScreen.width * scale
    const scaledWorldHeight = worldScreen.height * scale

    return {
      x: (screen.width - scaledWorldWidth) / 2,
      y: (screen.height - scaledWorldHeight) / 2,
    }
  }

  const setContextMenu = (event: PointerEvent) => {
    event.preventDefault()

    if (skipOnUIElement(event.target)) return

    rightClickOnCanvas('canvas', event.clientX, event.clientY, 'canvas', {})
  }

  useEventListener(document, 'pointerdown', startDrag)
  useEventListener(document, 'pointermove', updateDrag)
  useEventListener(document, 'pointerup', endDrag)

  useEventListener(document, 'wheel', zoomByWheel, { passive: false })

  useEventListener(document, 'contextmenu', setContextMenu, { passive: false })

  useResizeObserver(meCanvasWrapperRef, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    screen = { width: width, height: height }
    screenOrigin = {
      x: width / 2,
      y: height / 2,
    }
    if (firstMount) {
      centerCanvas(screenOrigin)
      firstMount = false
    } else {
      clampedToCanvas(screen)
    }
  })

  return { zoomIn, zoomOut, zoomReset, zoomFit, reCenter }
}
