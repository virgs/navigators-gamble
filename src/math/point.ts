export type Point = {
    x: number
    y: number
}

export const getDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}
export const getAngle = (p1: Point, p2: Point): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

export const rotatePoint = (point: Point, angle: number): Point => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos,
    }
}
const MATH_90_COS = Math.cos(-Math.PI / 2)
const MATH_90_SIN = Math.sin(-Math.PI / 2)

export const rotate90degreesCCW = (point: Point): Point => {
    return {
        x: point.x * MATH_90_COS - point.y * MATH_90_SIN,
        y: point.x * MATH_90_SIN + point.y * MATH_90_COS,
    }
}

export const normalize = (point: Point): Point => {
    const length = Math.sqrt(point.x ** 2 + point.y ** 2)
    if (length === 0) {
        return { x: 0, y: 0 }
    }
    return { x: point.x / length, y: point.y / length }
}
export const add = (p1: Point, p2: Point): Point => {
    return { x: p1.x + p2.x, y: p1.y + p2.y }
}
export const subtract = (p1: Point, p2: Point): Point => {
    return { x: p1.x - p2.x, y: p1.y - p2.y }
}

export const multiplyByScalar = (point: Point, scalar: number): Point => {
    return { x: point.x * scalar, y: point.y * scalar }
}
