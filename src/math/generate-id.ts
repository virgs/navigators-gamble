/** @type {Set<string>} */
const generatedUIDs = new Set()

/**
 * @param {string} [prefix='x'] Prefix all UIDs by string to apply a namespace or ensure starts with [A-Z] character
 * @param {number} [n] Maximum number of variations needed. Calculated as 36^n.
  @return {string} */
export const generateUID = (prefix = 'x', n = 3) => {
    let id
    while (
        generatedUIDs.has(
            (id = Math.random()
                .toString(36)
                .slice(2, n + 2))
        )
    );
    generatedUIDs.add(id)
    return `${prefix}${id}`
}
