import type { Link, typeLink } from '@/models/link'
import { curvaturePath, maxDistanceBetweenLinks, nodeDeviceSize } from './settings'
import { Vec, type Vec2 } from './vect'
import { lineIntersection } from './line-rect-intersection'

export const interfacesLine = (
  type: typeLink,
  src: Vec2,
  dst: Vec2,
  srcSize: { width: number; height: number },
  dstSize: { width: number; height: number },
) => {
  if (type === 'flowchart') {
    const middle = { x: (dst.x + src.x) / 2, y: (dst.y + src.y) / 2 }

    const cp1 = { x: middle.x, y: src.y }

    const cp2 = { x: middle.x, y: dst.y }

    const dsrc = src.x - cp1.x

    const directionSrc = dsrc == 0 ? 0 : dsrc / Math.abs(dsrc)

    const ddst = dst.x - cp2.x

    const directionDst = ddst == 0 ? 0 : ddst / Math.abs(ddst)

    const srcWidth = Math.abs(dsrc) - nodeDeviceSize.width / 2

    const dstWidth = Math.abs(ddst) - nodeDeviceSize.width / 2

    const radius = Math.sqrt((nodeDeviceSize.width / 2) ** 2 + (nodeDeviceSize.height / 2) ** 2)

    const radiusInterfaceSrc = Math.sqrt((srcSize.width / 2) ** 2 + (srcSize.height / 2) ** 2)

    const radiusInterfaceDst = Math.sqrt((dstSize.width / 2) ** 2 + (dstSize.height / 2) ** 2)

    const point1 =
      srcWidth > srcSize.width
        ? { x: src.x - directionSrc * (radius + radiusInterfaceSrc), y: src.y }
        : parametricLine(src, cp1, 1.0)

    const point2 =
      dstWidth > dstSize.width
        ? { x: dst.x - directionDst * (radius + radiusInterfaceDst), y: dst.y }
        : parametricLine(dst, cp2, 0.9)

    return [point1, point2]
  } else {
    const dx = dst.x - src.x
    const dy = dst.y - src.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = len == 0 ? 0 : dx / len
    const uy = len == 0 ? 0 : dy / len

    const radius = Math.sqrt((nodeDeviceSize.width / 2) ** 2 + (nodeDeviceSize.height / 2) ** 2)

    const radiusInterfaceSrc = Math.sqrt((srcSize.width / 2) ** 2 + (srcSize.height / 2) ** 2)

    const radiusInterfaceDst = Math.sqrt((dstSize.width / 2) ** 2 + (dstSize.height / 2) ** 2)

    const point1 = {
      x: src.x + ux * (radius + radiusInterfaceSrc),
      y: src.y + uy * (radius + radiusInterfaceSrc),
    }

    const point2 = {
      x: dst.x - ux * (radius + radiusInterfaceDst),
      y: dst.y - uy * (radius + radiusInterfaceDst),
    }

    if (type === 's-curve') {
      const t1 = interfaceOnLine(src, dst, point1)
      const t2 = interfaceOnLine(src, dst, point2)

      const { cp1, cp2 } = generateScurve(src, dst)

      const point1OnCubic = cubicPoint(t1, src, cp1, cp2, dst)
      const point2OnCubic = cubicPoint(t2, src, cp1, cp2, dst)

      return [point1OnCubic, point2OnCubic]
    }

    return [point1, point2]
  }
}

export const paralleLine = (x1: number, y1: number, x2: number, y2: number, d: number) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)

  if (len == 0) return [0, 0]

  const offsetX = (-dy * d) / len
  const offsetY = (dx * d) / len

  return [offsetX, offsetY]
}

export const paralleLineDeviceByDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  d: number,
) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)

  if (len == 0) return [0, 0]

  const ux = -dy / len
  const uy = dx / len

  const point1 = {
    x: x1 + nodeDeviceSize.width / 2 - ux * d,
    y: y1 + nodeDeviceSize.height / 2 - uy * d,
  }

  const point2 = {
    x: x2 + nodeDeviceSize.width / 2 - ux * d,
    y: y2 + nodeDeviceSize.height / 2 - uy * d,
  }

  return [point1, point2]
}

export const curvedQuadraticLine = (x1: number, y1: number, x2: number, y2: number, d: number) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)

  if (len == 0) return { x: 0, y: 0 }

  const ux = -dy / len
  const uy = dx / len

  const middle = { x: (x2 + x1) / 2, y: (y2 + y1) / 2 }

  const curvedQuadratic = {
    x: middle.x - ux * d,
    y: middle.y - uy * d,
  }

  return curvedQuadratic
}

export const curvedArcLine = (line1Src: Vec2, line1Dst: Vec2, line2Src: Vec2, line2Dst: Vec2) => {
  const curveness = lineIntersection(line1Src, line1Dst, line2Dst, line2Src)

  if (curveness) {
    return curveness
  }

  return false
}

export const pathParallelStraight = (link: Link): { sourcePos: Vec2; targetPos: Vec2 } => {
  const distanceBetweenLines = Math.max(
    maxDistanceBetweenLinks,
    nodeDeviceSize.height / link.totalLinks,
  )

  const source = link.sourcePos
  const target = link.targetPos

  const [offsetX, offsetY] = paralleLine(
    source.x,
    source.y,
    target.x,
    target.y,
    (-(link.totalLinks - 1) / 2 + link.indexLink) * distanceBetweenLines,
  )

  const srcPath: Vec2 = {
    x: link.sourceRect.x + nodeDeviceSize.width / 2 + offsetX,
    y: link.sourceRect.y + nodeDeviceSize.height / 2 + offsetY,
  }
  const dstPath: Vec2 = {
    x: link.targetRect.x + nodeDeviceSize.width / 2 + offsetX,
    y: link.targetRect.y + nodeDeviceSize.height / 2 + offsetY,
  }

  return { sourcePos: srcPath, targetPos: dstPath }
}

export const livePathParallelStraight = (
  link: Link,
  srcLive: Vec2,
  dstLive: Vec2,
): { sourcePos: Vec2; targetPos: Vec2 } => {
  const distanceBetweenLines = Math.max(
    maxDistanceBetweenLinks,
    nodeDeviceSize.height / link.totalLinks,
  )

  const source = link.sourcePos
  const target = link.targetPos

  const liveSource = Vec.add(source, srcLive)
  const liveTarget = Vec.add(target, dstLive)

  const [offsetX, offsetY] = paralleLine(
    liveSource.x,
    liveSource.y,
    liveTarget.x,
    liveTarget.y,
    (-(link.totalLinks - 1) / 2 + link.indexLink) * distanceBetweenLines,
  )

  const srcPath: Vec2 = {
    x: link.sourceRect.x + srcLive.x + nodeDeviceSize.width / 2 + offsetX,
    y: link.sourceRect.y + srcLive.y + nodeDeviceSize.height / 2 + offsetY,
  }
  const dstPath: Vec2 = {
    x: link.targetRect.x + dstLive.x + nodeDeviceSize.width / 2 + offsetX,
    y: link.targetRect.y + dstLive.y + nodeDeviceSize.height / 2 + offsetY,
  }

  return { sourcePos: srcPath, targetPos: dstPath }
}

export const pathParallel = (link: Link): Link => {
  return { ...link, ...pathParallelStraight(link) }
}

export const livePathParallel = (link: Link, srcLive: Vec2, dstLive: Vec2): Link => {
  return { ...link, ...livePathParallelStraight(link, srcLive, dstLive) }
}

export const generatePath = (type: typeLink, sourcePos: Vec2, targetPos: Vec2) => {
  if (type === 'straight') {
    return `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`
  } else if (type === 's-curve') {
    const { cp1, cp2 } = generateScurve(sourcePos, targetPos)
    return `M ${sourcePos.x} ${sourcePos.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${targetPos.x} ${targetPos.y}`
  } else if (type === 'flowchart') {
    const middle = { x: (targetPos.x + sourcePos.x) / 2, y: (targetPos.y + sourcePos.y) / 2 }

    const cp1 = { x: middle.x, y: sourcePos.y }

    const cp2 = { x: middle.x, y: targetPos.y }

    return `M ${sourcePos.x} ${sourcePos.y} L ${cp1.x} ${cp1.y} L ${cp2.x} ${cp2.y} L  ${targetPos.x} ${targetPos.y}`
  }
  return ''
}

const generateScurve = (sourcePos: Vec2, targetPos: Vec2) => {
  const dx = targetPos.x - sourcePos.x
  const dy = targetPos.y - sourcePos.y
  const len = Math.sqrt(dx * dx + dy * dy)

  const normal = len == 0 ? { x: 0, y: 0 } : { x: -dy / len, y: dx / len }

  const cp1X = normal.x * curvaturePath
  const cp1Y = normal.y * curvaturePath

  const cp2X = -normal.x * curvaturePath
  const cp2Y = -normal.y * curvaturePath

  const middle = { x: (targetPos.x + sourcePos.x) / 2, y: (targetPos.y + sourcePos.y) / 2 }

  const cp1 = { x: middle.x + cp1X, y: middle.y + cp1Y }
  const cp2 = { x: middle.x + cp2X, y: middle.y + cp2Y }

  return { cp1, cp2 }
}

function interfaceOnLine(A: Vec2, B: Vec2, C: Vec2): number {
  const vx = B.x - A.x,
    vy = B.y - A.y
  const wx = C.x - A.x,
    wy = C.y - A.y

  const denom = vx * vx + vy * vy

  if (denom === 0) return 0 // A==B

  const t = (wx * vx + wy * vy) / denom

  return Math.max(0, Math.min(1, t))
}

function cubicPoint(t: number, P0: Vec2, P1: Vec2, P2: Vec2, P3: Vec2): Vec2 {
  const u = 1 - t
  return {
    x: u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x,
    y: u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y,
  }
}

function parametricLine(A: Vec2, B: Vec2, t: number) {
  const u = 1 - t

  return { x: u * A.x + t * B.x, y: u * A.y + t * B.y }
}
