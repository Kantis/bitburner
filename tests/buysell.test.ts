import { localMaxIndexes, localMinIndexes, maxProfit } from "../src/cct/buysell";

test('buysell', () => {
    expect(localMaxIndexes([1, 2, 1, 3])).toStrictEqual([1, 3])
    expect(localMaxIndexes([1])).toStrictEqual([0])
})

test('solve3', () => {
    expect(localMaxIndexes([134, 85, 128, 104, 124, 49, 132, 59, 126, 98, 11, 135, 159, 181, 110, 150, 113, 193, 22, 60, 88, 23, 25, 85, 102, 122, 151, 125, 99, 115, 124, 175, 196, 164])).toStrictEqual(
        [
            0,
            2,
            4,
            6,
            8,
            13,
            15,
            17,
            20,
            26,
            32,
        ])


    // 22 -> 196
    // 11 -> 193

    expect(localMinIndexes([134, 85, 128, 104, 124, 49, 132, 59, 126, 98, 11, 135, 159, 181, 110, 150, 113, 193, 22, 60, 88, 23, 25, 85, 102, 122, 151, 125, 99, 115, 124, 175, 196, 164])).toStrictEqual(
        [
            1,
            3,
            5,
            7,
            10,
            14,
            16,
            18,
            21,
            28,
            33,
        ]
    )
})

test('solve2', () => {
    const prices = [85,75,39,86,85,162,57,83,21,109,196,67,157,183,195,7,26,150,164,22,62,7,1,18,29,200,55,20,115,150,82]
    expect(localMinIndexes(prices).length).toBe(localMaxIndexes(prices).length)
})