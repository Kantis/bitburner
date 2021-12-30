import { localMaxIndexes } from "../src/cct/buysell";
test('buysell', () => {
    expect(localMaxIndexes([1, 2, 1, 3])).toStrictEqual([1, 3])
})