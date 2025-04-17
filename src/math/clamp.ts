type Limits = {
    min: number
    max: number
    step: number
}

export const clamp = (value: number, { min, max, step }: Limits): number => {
    // First ensure value is between min and max
    const bounded = Math.max(min, Math.min(value, max))

    // Then adjust to nearest step
    const steps = Math.round((bounded - min) / step)
    const stepped = min + steps * step

    // Ensure the result is still within bounds (in case of rounding)
    return Math.max(min, Math.min(stepped, max))
}
