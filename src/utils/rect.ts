import type { Vec2 } from './vect.ts'

export class Rect {
  public x: number
  public y: number
  public width: number
  public height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  static fromCenter(center: Vec2, width: number, height: number): Rect {
    return new Rect(center.x - width / 2, center.y - height / 2, width, height)
  }

  static fromLTWH(x: number, y: number, width: number, height: number): Rect {
    return new Rect(x, y, width, height)
  }

  static fromPoints(p1: Vec2, p2: Vec2): Rect {
    const x = Math.min(p1.x, p2.x)
    const y = Math.min(p1.y, p2.y)
    const width = Math.abs(p2.x - p1.x)
    const height = Math.abs(p2.y - p1.y)
    return new Rect(x, y, width, height)
  }

  get left(): number {
    return this.x
  }

  get right(): number {
    return this.x + this.width
  }

  get top(): number {
    return this.y
  }

  get bottom(): number {
    return this.y + this.height
  }

  get center(): Vec2 {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 }
  }

  containsPoint(p: Vec2): boolean {
    return p.x >= this.left && p.x <= this.right && p.y >= this.top && p.y <= this.bottom
  }

  containsRect(other: Rect): boolean {
    return (
      other.left >= this.left &&
      other.right <= this.right &&
      other.top >= this.top &&
      other.bottom <= this.bottom
    )
  }

  intersects(other: Rect): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    )
  }

  overlapArea(other: Rect): number {
    if (!this.intersects(other)) return 0
    const xOverlap = Math.min(this.right, other.right) - Math.max(this.left, other.left)
    const yOverlap = Math.min(this.bottom, other.bottom) - Math.max(this.top, other.top)
    return xOverlap * yOverlap
  }

  inflate(dx: number, dy: number): Rect {
    return new Rect(this.x - dx, this.y - dy, this.width + 2 * dx, this.height + 2 * dy)
  }

  union(other: Rect): Rect {
    const left = Math.min(this.left, other.left)
    const top = Math.min(this.top, other.top)
    const right = Math.max(this.right, other.right)
    const bottom = Math.max(this.bottom, other.bottom)
    return new Rect(left, top, right - left, bottom - top)
  }

  intersection(other: Rect): Rect | null {
    const left = Math.max(this.left, other.left)
    const top = Math.max(this.top, other.top)
    const right = Math.min(this.right, other.right)
    const bottom = Math.min(this.bottom, other.bottom)
    if (left >= right || top >= bottom) return null
    return new Rect(left, top, right - left, bottom - top)
  }

  expandToInclude(p: Vec2): Rect {
    const left = Math.min(this.left, p.x)
    const right = Math.max(this.right, p.x)
    const top = Math.min(this.top, p.y)
    const bottom = Math.max(this.bottom, p.y)
    return new Rect(left, top, right - left, bottom - top)
  }

  translate(dx: number, dy: number): Rect {
    return new Rect(this.x + dx, this.y + dy, this.width, this.height)
  }

  scale(sx: number, sy: number = sx): Rect {
    return new Rect(this.x, this.y, this.width * sx, this.height * sy)
  }

  static isRectVisible(rect: Rect, viewport: Rect): boolean {
    return !(
      rect.x + rect.width < viewport.x ||
      rect.x > viewport.x + viewport.width ||
      rect.y + rect.height < viewport.y ||
      rect.y > viewport.y + viewport.height
    )
  }

  equals(other: Rect): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    )
  }

  toString(): string {
    return `Rect(x: ${this.x}, y: ${this.y}, w: ${this.width}, h: ${this.height})`
  }
}
