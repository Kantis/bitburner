import { factorialize } from '../src/cct/largest-prime'
test('largest prime', () => {
    // expect(largestPrime(2)).toBe(2)
    // expect(largestPrime(3)).toBe(3)
    // expect(largestPrime(6)).toBe(3)
    expect(factorialize(2)).toStrictEqual([2])
    expect(factorialize(4)).toStrictEqual([2, 2])
    // expect(largestPrime(9)).toBe(3)
    // expect(largestPrime(7)).toBe(7)
    // expect(largestPrime(21)).toBe(7)
    expect(factorialize(81)).toStrictEqual([3, 3, 3, 3])
    expect(factorialize(960947176)).toStrictEqual([2, 2, 2, 7, 23, 31, 41, 587])
})