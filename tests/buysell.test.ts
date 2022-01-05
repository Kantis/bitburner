import { stockTraderOne, localMaxIndexes, localMinIndexes, maxProfit, stockTraderFour, stockTraderTwo } from "../src/cct/buysell";

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

test('solve1', () => {
    const prices = [45,66,18,13,196,123,151,160,183,12,169,51,155,32,19,177,2,93,160,18,143,98,76,152,28,68,105,46,154,179,55,64,165,29,39,178]
    expect(stockTraderOne(prices)).toBe(183)
})

test('solve4', () => {
    const prices = [48,100,92,88,121,11,72,111,113,194,128,67,141,153,112,78,193,156,131,99,143]
    expect(stockTraderFour([1, prices])).toBe(183)
    expect(stockTraderFour([2, prices])).toBe(309)
})

test('solve2', () => {
    const prices = [107,46,75,78,86,185,36,36,161,5,50,184,85,20,147,7,38,10,159,1,27,138,199,39,191,134,191,174,48,76,156,159,5,28]
    console.log(localMaxIndexes(prices))
    console.log(localMinIndexes(prices))

    expect(stockTraderTwo(prices)).toBe(1)
})