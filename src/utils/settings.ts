import type { Vec2 } from './vect'

export const worldScreen: { width: number; height: number } = {
  width: 3000,
  height: 3000,
}

export const worldOrigin: Vec2 = {
  x: worldScreen.width / 2,
  y: worldScreen.height / 2,
}

export const gridCellSize = 20

export const portGap = 20

export const nodeDeviceSize = { width: 60, height: 60 }

export const maxLinksPerNode = 16

export const maxDistanceBetweenLinks = 8

export const maxLinks = 8

export const curvaturePath = 100

export const tags = ['rip', 'ospf', 'eigrp', 'bgp']

export const tagscolors: { [index: string]: string } = {
  rip: '#dddbf440',
  ospf: '#f3dbe640',
  eigrp: '#e3eae740',
  bgp: '#ebc4cd40',
}

export const tagsStrokecolors: { [index: string]: string } = {
  rip: '#9999cc',
  ospf: '#cfbec6',
  eigrp: '#a9b5af',
  bgp: '#c44e69',
}
