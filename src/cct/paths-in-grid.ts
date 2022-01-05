import { range } from "/libs/std.js"

export function solveFirst([width, height]: [number, number]): number {
    return pathsInGrid(range(0, height).map(_ => new Array<number>(width).fill(0)))
}

export function pathsInGrid(grid: number[][]): number {
    const width = grid[0].length
    const height = grid.length

    grid = grid.map(row => row.map(p => -1 * p))

    grid[0][0] = 1

    function update([x, y]: [number, number]): void {
        if (grid[y][x] === -1) return

        if (x + 1 < width && grid[y][x + 1] !== -1)
            grid[y][x + 1] += grid[y][x]

        if (y + 1 < height && grid[y + 1][x] !== -1)
            grid[y + 1][x] += grid[y][x]
    }

    for (const i of range(0, height)) {
        for (const j of range(0, width)) {
            update([j, i])
        }
    }

    return grid[height - 1][width - 1]
}