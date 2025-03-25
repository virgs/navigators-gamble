export enum CardValues {
    NORTH = 0,
    NORTH_EAST = 1,
    EAST = 2,
    SOUTH_EAST = 3,
    SOUTH = 4,
    SOUTH_WEST = 5,
    WEST = 6,
    NORTH_WEST = 7,
}

export const cardValues: string[] = Object.keys(CardValues).filter((value) => Number(isNaN(Number(value))))

export const isNextInCardValues = (
    cardValue1: CardValues, // NORTH
    cardValue2: CardValues // NORTH_EAST
): boolean /* true */ => {
    return cardValue1 === (cardValue2 - 1 + cardValues.length) % cardValues.length
}

export const isPreviousInCardValues = (cardValue1: CardValues, cardValue2: CardValues): boolean => {
    return isNextInCardValues(cardValue2, cardValue1)
}

export const cardValueToName = (cardValue?: CardValues): string => {
    switch (cardValue) {
        case CardValues.NORTH:
            return 'NORTH'
        case CardValues.NORTH_EAST:
            return 'NORTH_EAST'
        case CardValues.EAST:
            return 'EAST'
        case CardValues.SOUTH_EAST:
            return 'SOUTH_EAST'
        case CardValues.SOUTH:
            return 'SOUTH'
        case CardValues.SOUTH_WEST:
            return 'SOUTH_WEST'
        case CardValues.WEST:
            return 'WEST'
        case CardValues.NORTH_WEST:
            return 'NORTH_WEST'
        default:
            return 'UNKNOWN'
    }
}

export const cardValueToAngle = (cardValue: CardValues): number => {
    switch (cardValue) {
        case CardValues.NORTH:
            return 0
        case CardValues.NORTH_EAST:
            return 45
        case CardValues.EAST:
            return 90
        case CardValues.SOUTH_EAST:
            return 135
        case CardValues.SOUTH:
            return 180
        case CardValues.SOUTH_WEST:
            return 225
        case CardValues.WEST:
            return 270
        case CardValues.NORTH_WEST:
            return 315
    }
}
