import { getDistance, Point } from './point'

export type Line = {
    start: Point
    end: Point
}

// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
const isPointOnSegment = (point: Point, segment: Line) => {
    const start = segment.start
    const end = segment.end
    if (
        point.x <= Math.max(start.x, end.x) &&
        point.x >= Math.min(start.x, end.x) &&
        point.y <= Math.max(start.y, end.y) &&
        point.y >= Math.min(start.y, end.y)
    )
        return true

    return false
}

// To find orientation of ordered triplet (start, middle, end).
// The function returns the following values:
// 0 --> start, middle, and end are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
const getOrientation = (start: Point, middle: Point, end: Point) => {
    const value = (middle.y - start.y) * (end.x - middle.x) - (middle.x - start.x) * (end.y - middle.y)

    if (value === 0) return 0 // collinear

    return value > 0 ? 1 : 2 // clockwise or counterclockwise
}

// The main function that returns true if line segment 'line1'
// and 'line2' intersect, considering a tolerance for proximity to endpoints.
export const doLinesIntersect = (line1: Line, line2: Line, tolerance: number = 0.1) => {
    const line1Start = line1.start
    const line1End = line1.end
    const line2Start = line2.start
    const line2End = line2.end

    // Find the four orientations needed for general and special cases
    const orientation1 = getOrientation(line1Start, line1End, line2Start)
    const orientation2 = getOrientation(line1Start, line1End, line2End)
    const orientation3 = getOrientation(line2Start, line2End, line1Start)
    const orientation4 = getOrientation(line2Start, line2End, line1End)

    // General case
    if (orientation1 !== orientation2 && orientation3 !== orientation4) {
        // Check if the intersection point is too close to any endpoint
        if (
            getDistance(line1Start, line2Start) < tolerance ||
            getDistance(line1Start, line2End) < tolerance ||
            getDistance(line1End, line2Start) < tolerance ||
            getDistance(line1End, line2End) < tolerance
        ) {
            return false
        }
        return true
    }

    // Special Cases
    if (orientation1 === 0 && isPointOnSegment(line2Start, line1)) {
        if (getDistance(line2Start, line1Start) < tolerance || getDistance(line2Start, line1End) < tolerance) {
            return false
        }
        return true
    }

    if (orientation2 === 0 && isPointOnSegment(line2End, line1)) {
        if (getDistance(line2End, line1Start) < tolerance || getDistance(line2End, line1End) < tolerance) {
            return false
        }
        return true
    }

    if (orientation3 === 0 && isPointOnSegment(line1Start, line2)) {
        if (getDistance(line1Start, line2Start) < tolerance || getDistance(line1Start, line2End) < tolerance) {
            return false
        }
        return true
    }

    if (orientation4 === 0 && isPointOnSegment(line1End, line2)) {
        if (getDistance(line1End, line2Start) < tolerance || getDistance(line1End, line2End) < tolerance) {
            return false
        }
        return true
    }

    return false // Doesn't fall in any of the above cases
}
