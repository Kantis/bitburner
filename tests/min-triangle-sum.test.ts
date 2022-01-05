import { minTrianglePath } from '../src/cct/min-triangle-sum'

test('example', () => {
    expect(minTrianglePath(
        [
            [2],
            [3, 4],
            [6, 5, 7],
            [4, 1, 8, 3]
        ]
    )).toBe(11)
})