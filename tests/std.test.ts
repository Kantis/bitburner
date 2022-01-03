import { convertToObject } from 'typescript'
import { nextSecond, parseNumber } from '../src/libs/std'

test('parses valid numbers', () => {
    expect(parseNumber('3M')).toBe(3_000_000)
    expect(parseNumber('3B')).toBe(3_000_000_000)
    expect(parseNumber('3T')).toBe(3_000_000_000_000)
    expect(parseNumber('3Q')).toBe(3_000_000_000_000_000)
})

test('next second', () => {
    expect(nextSecond(1234)).toBe(2000)
    expect(nextSecond(1234.12)).toBe(2000)
})