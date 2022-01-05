export function minTrianglePath(input: number[][]): number {
    if (input.length == 1) {
        return input[0][0]
    }

    const left = minTrianglePath(input.slice(1).map(a => a.slice(0, -1)))
    const right = minTrianglePath(input.slice(1).map(a => a.slice(1)))

    return input[0][0] + Math.min(left, right)
}