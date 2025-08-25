import type { Rect } from '@/utils/rect'
import type { Vec2 } from '@/utils/vect'

export type typeLink = 'straight' | 's-curve' | 'flowchart'

export type Link = {
  id: string
  type: typeLink
  indexLink: number
  totalLinks: number
  labelName: string
  sourceNodeId: string
  targetNodeId: string
  sourceRect: Rect
  targetRect: Rect
  sourceInterfaceName: string
  targetInterfaceName: string
  sourcePos: Vec2
  targetPos: Vec2
}
