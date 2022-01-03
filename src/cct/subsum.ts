import { hasSubscribers } from "diagnostics_channel";
import { range } from "/libs/std.js";

export function maximumSubsum(numbers: number[]): number {
    var max = 0
    for (const i of range(0, numbers.length)) {
        for (const j of range(0, numbers.length)) {
            if (j > i) {
                const subsum = numbers.slice(i, j + 1).reduce((a, b) => a + b)
                if (subsum > max) {
                    max = subsum
                }
            }
        }
    }

    return max
}