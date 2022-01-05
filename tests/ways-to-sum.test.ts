import { waysToSum } from '../src/cct/ways-to-sum'

test('five', () => {
    // 4 + 1
    // 3 + 2
    // 3 + 1 + 1
    // 2 + 2 + 1
    // 2 + 1 + 1 + 1
    // 1 + 1 + 1 + 1 + 1
    expect(waysToSum(5)).toBe(6)

    // 5 + 1
    // 4 + 2
    // 4 + 1 + 1
    // 3 + 3
    // 3 + 2 + 1
    // 3 + 1 + 1 + 1
    // 2 + 2 + 2
    // 2 + 2 + 1 + 1
    // 2 + 1 + 1 + 1 + 1
    // 1 + 1 + 1 + 1 + 1 + 1
    expect(waysToSum(6)).toBe(10)
})

test('big', () => {
    expect(waysToSum(46)).toBe(2)
})