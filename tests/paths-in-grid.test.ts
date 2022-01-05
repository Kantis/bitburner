import { solveFirst } from '../src/cct/paths-in-grid'

test('2x2', () => {
    expect(solveFirst([2, 2])).toBe(2)
})

test('2x3', () => {
    expect(solveFirst([2, 3])).toBe(3)
})

test('3x2', () => {
    expect(solveFirst([3, 2])).toBe(3)
})

test('14x3', () => {
    expect(solveFirst([14, 3])).toBe(105)
})