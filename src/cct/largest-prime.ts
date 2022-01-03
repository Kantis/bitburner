import { range } from "/libs/std.js";

export function factorialize(input: number): number[] {
    const factors = []
    var p = 2

    while (input >= p * p) {
        if (input % p == 0) {
            factors.push(p)
            input = input / p
        } else {
            p += 1
        }
    }

    return [...factors, input]
}