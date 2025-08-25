export type Vec2 = { x: number; y: number }

export class Vec {
  static zero(): Vec2 {
    return { x: 0, y: 0 }
  }

  static clone(v: Vec2): Vec2 {
    return { x: v.x, y: v.y }
  }

  static add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y }
  }

  static sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y }
  }

  static scale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s }
  }

  static div(v: Vec2, d: number): Vec2 {
    return { x: v.x / d, y: v.y / d }
  }

  static length(v: Vec2): number {
    return Math.hypot(v.x, v.y)
  }

  static distance(a: Vec2, b: Vec2): number {
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  static normalize(v: Vec2): Vec2 {
    const len = Vec.length(v)
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len }
  }

  static dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y
  }

  static cross(a: Vec2, b: Vec2): number {
    return a.x * b.y - a.y * b.x
  }

  static angle(a: Vec2, b: Vec2): number {
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  static midpoint(a: Vec2, b: Vec2): Vec2 {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }

  static equals(a: Vec2, b: Vec2): boolean {
    return a.x === b.x && a.y === b.y
  }

  static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    }
  }

  static isZero(v: Vec2): boolean {
    return v.x === 0 && v.y === 0
  }

  static translate(v: Vec2, t: Vec2): Vec2 {
    return { x: v.x + t.x, y: v.y + t.y }
  }
}
