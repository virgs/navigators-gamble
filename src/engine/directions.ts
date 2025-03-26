export enum Directions {
    NORTH = 0,
    NORTH_EAST = 1,
    EAST = 2,
    SOUTH_EAST = 3,
    SOUTH = 4,
    SOUTH_WEST = 5,
    WEST = 6,
    NORTH_WEST = 7,
}

export const directions: string[] = Object.keys(Directions).filter((value) => Number(isNaN(Number(value))))

export const isNextClockWise = (
    first: Directions, // NORTH
    second: Directions // NORTH_EAST
): boolean /* true */ => {
    return first === (second - 1 + directions.length) % directions.length
}

export const isPreviousClockWise = (first: Directions, second: Directions): boolean => {
    return isNextClockWise(second, first)
}

export const directionToAngle = (direction: Directions): number => {
    switch (direction) {
        case Directions.NORTH:
            return 0
        case Directions.NORTH_EAST:
            return 45
        case Directions.EAST:
            return 90
        case Directions.SOUTH_EAST:
            return 135
        case Directions.SOUTH:
            return 180
        case Directions.SOUTH_WEST:
            return 225
        case Directions.WEST:
            return 270
        case Directions.NORTH_WEST:
            return 315
    }
}
