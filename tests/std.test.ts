import { parseNumber } from '../src/libs/std'

test('parses valid numbers', () => {
    expect(parseNumber('3M')).toBe(3_000_000)
})