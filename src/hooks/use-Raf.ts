import { onUnmounted } from 'vue'

export function useRAF() {
  let requestRef: number | null = null
  let queuedCallback: FrameRequestCallback | null = null

  const scheduleRAF = (callback: FrameRequestCallback) => {
    queuedCallback = callback
    requestRef ??= requestAnimationFrame((time) => {
      requestRef = null
      queuedCallback?.(time)
      queuedCallback = null
    })
  }

  const cancel = () => {
    if (requestRef !== null) {
      cancelAnimationFrame(requestRef)
      requestRef = null
      queuedCallback = null
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return { scheduleRAF, cancel }
}
