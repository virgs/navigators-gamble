import { Vertix } from '../graph/vertix'

export class SequenceMerger {
    private readonly seenKeys = new Set<string>()

    public merge(clockwiseSequences: Vertix[][], counterClockwiseSequences: Vertix[][]): Vertix[][] {
        const uniqueMerged: Vertix[][] = []

        if (clockwiseSequences.length === 0 || counterClockwiseSequences.length === 0) {
            const all = clockwiseSequences.concat(counterClockwiseSequences)
            return this.filterUniqueSequences(all)
        }

        for (const ccw of counterClockwiseSequences) {
            for (const cw of clockwiseSequences) {
                const overlapIndex = cw.findIndex((v) => !ccw.includes(v))
                const tail = overlapIndex === -1 ? [] : cw.slice(overlapIndex)
                const merged = [...ccw, ...tail]
                const key = merged.map((v) => v.id).join('-')

                if (!this.seenKeys.has(key)) {
                    this.seenKeys.add(key)
                    uniqueMerged.push(merged)
                }
            }
        }

        return uniqueMerged
    }

    private filterUniqueSequences(sequences: Vertix[][]): Vertix[][] {
        const result: Vertix[][] = []

        for (const seq of sequences) {
            const key = seq.map((v) => v.id).join('-')
            if (!this.seenKeys.has(key)) {
                this.seenKeys.add(key)
                result.push(seq)
            }
        }

        return result
    }
}
