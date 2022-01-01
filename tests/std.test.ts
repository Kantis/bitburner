import { parseNumber } from '../src/libs/std'

test('parses valid numbers', () => {
    expect(parseNumber('3M')).toBe(3_000_000)
    expect(parseNumber('3B')).toBe(3_000_000_000)
    expect(parseNumber('3T')).toBe(3_000_000_000_000)
    expect(parseNumber('3Q')).toBe(3_000_000_000_000_000)
})