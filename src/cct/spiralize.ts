type Point = [number, number]
type Direction = 'Up' | 'Down' | 'Left' | 'Right'

function nextPoint(p: Point, d: Direction): Point {
    const [x, y] = p
    switch (d) {
        case 'Right': return [x + 1, y]
        case 'Down': return [x, y + 1]
        case 'Left': return [x - 1, y]
        case 'Up': return [x, y - 1]
    }
}

function nextDir(d: Direction): Direction {
    switch (d) {
        case 'Right': return 'Down'
        case 'Down': return 'Left'
        case 'Left': return 'Up'
        case 'Up': return 'Right'
    }
}

function* spiral(width: number, height: number): Generator<Point> {
    console.log('W: ', width, 'H:', height)
    var dir: Direction = 'Right'
    var p: Point = [0, 0]
    var visited: Point[] = [p]

    yield p
    console.log(p)

    while (visited.length < width * height) {
        const n = nextPoint(p, dir)
        console.log('Prel next: ', n)
        const [n_x, n_y] = n

        console.log(visited)
        if (visited.some(v => v[0] == n_x && v[1] == n_y) || n_x >= width || n_x < 0 || n_y >= height || n_y < 0) {
            dir = nextDir(dir)
            console.log('New dir: ', dir)
            p = nextPoint(p, dir)
        } else {
            p = nextPoint(p, dir)
        }

        yield p
        console.log(p)
        visited.push(p)
    }
}

export function spiralize(input: number[][]): number[] {
    const result = []
    for (const [y, x] of spiral(input[0].length, input.length)) {
        result.push(input[x][y])
    }

    return result
}