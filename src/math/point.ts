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
