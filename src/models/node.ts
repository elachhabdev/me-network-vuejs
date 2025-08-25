import type { Rect } from '@/utils/rect'

export type NodeBase = {
  id: string
  rect: Rect
  isCreated: boolean
}

export type NodeItem = {
  type: 'nodeDevice'
  deviceType: 'switch' | 'router'
  title: string
}

export type NodeTextItem = {
  type: 'nodeText'
  body: string
}

export type NodeText = NodeBase & NodeTextItem
export type NodeDevice = NodeBase & NodeItem
