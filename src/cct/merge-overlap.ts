import { firstOrNull, range } from "/libs/std.js";

type Range = [number, number];

export function mergeOverlapping(input: Range[]): Range[] {
    const min = Math.min(...input.flat())
    const max = Math.max(...input.flat())
    const seenNumbers = new Map<number, boolean>()

    for (const [a, b] of input) {
        range(a, b + 1).forEach(i => seenNumbers.set(i, true))
    }
    
    const result: Range[] = []
    var currentRange: (Range | undefined) = undefined
    for (const i of range(min, max + 1)) {
        if (seenNumbers.get(i)) {
            if (currentRange === undefined) {
                currentRange = [i, i]
            } else {
                currentRange[1] = i
            }
        } 
        
        if (!seenNumbers.get(i) || i == max) {
            result.push(currentRange!!)
            currentRange = undefined
        }
    }

    return result!!
}