import { nodeDeviceSize } from './settings'
import type { Vec2 } from './vect'

export function polygonCentroid(points: Vec2[]): Vec2 {
  let area = 0
  let cx = 0
  let cy = 0

  const n = points.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const cross = points[i].x * points[j].y - points[j].x * points[i].y
    area += cross
    cx += (points[i].x + points[j].x) * cross
    cy += (points[i].y + points[j].y) * cross
  }

  area *= 0.5
  cx /= 6 * area
  cy /= 6 * area

  return { x: cx, y: cy }
}

function cross(o: Vec2, a: Vec2, b: Vec2) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

export function convexHull(points: Vec2[]): Vec2[] {
  if (points.length <= 1) return points.slice()

  points.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y))

  const lower: Vec2[] = []
  for (const p of points) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop()
    lower.push(p)
  }

  const upper: Vec2[] = []
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop()
    upper.push(p)
  }

  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

export function deviceRectToPointsWithPadding(
  device: { rect: { x: number; y: number; width: number; height: number } },
  padding: number,
) {
  const { x, y, width, height } = device.rect
  return [
    { x: x - padding, y: y - padding },
    { x: x + width + padding, y: y - padding },
    { x: x + width + padding, y: y + height + padding },
    { x: x - padding, y: y + height + padding },
  ]
}

export const generatePathConvexHull = (hullPoints: Vec2[]) => {
  if (hullPoints.length < 3) return ''

  const n = hullPoints.length
  let path = ''

  const radius = Math.sqrt(nodeDeviceSize.width ** 2 + nodeDeviceSize.height ** 2) / 2

  for (let i = 0; i < n; i++) {
    const prev = hullPoints[(i - 1 + n) % n]
    const curr = hullPoints[i]
    const next = hullPoints[(i + 1) % n]

    // Edge vectors
    const vPrev = { x: curr.x - prev.x, y: curr.y - prev.y }
    const vNext = { x: next.x - curr.x, y: next.y - curr.y }

    const lenPrev = Math.sqrt(vPrev.x ** 2 + vPrev.y ** 2)
    const lenNext = Math.sqrt(vNext.x ** 2 + vNext.y ** 2)

    const uPrev = { x: vPrev.x / lenPrev, y: vPrev.y / lenPrev }
    const uNext = { x: vNext.x / lenNext, y: vNext.y / lenNext }

    const startPoint = { x: curr.x - uPrev.x * radius, y: curr.y - uPrev.y * radius }
    const endPoint = { x: curr.x + uNext.x * radius, y: curr.y + uNext.y * radius }

    if (i === 0) {
      path += `M ${startPoint.x} ${startPoint.y} `
    } else {
      path += `L ${startPoint.x} ${startPoint.y} `
    }

    path += `Q ${curr.x} ${curr.y} ${endPoint.x} ${endPoint.y} `
  }

  path += 'Z'

  return path
}
