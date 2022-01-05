import { notStrictEqual } from 'assert'
import { BitBurner } from 'Bitburner'
import { add, range } from '/libs/std.js'

/**
 * Algorithmic Stock Trader IV
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * You are given the following array with two elements:
 * 
 * [4, [169,31,119,129,61,171,35,98,140,61,19,7,85,128,40,140,49,162,80,40,83,124,120,49,125,183,119,15,92,47,169,51,135,42,89,199,154,122,19,85,147,22,92,60,29,118,81]]
 * 
 * The first element is an integer k. The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.
 * 
 * Determine the maximum possible profit you can earn using at most k transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.
 * 
 * If no profit can be made, then the answer should be 0.
 */
export function stockTraderFour([transactions, prices]: [number, number[]]): number {
    const byPriceDesc = (i0: number, i1: number) => prices[i1] - prices[i0]
    const byPriceAsc = (i0: number, i1: number) => prices[i0] - prices[i1]

    const maximas = localMaxIndexes(prices).sort(byPriceDesc)
    const minimas = localMinIndexes(prices).sort(byPriceAsc)

    console.log('Sorted maximas', maximas.map(x => [x, prices[x]]))
    console.log('Sorted minimas', minimas.map(x => [x, prices[x]]))


    return 0
}

export function stockTraderOne(prices: number[]): number {
    const maximas = localMaxIndexes(prices)
    const minimas = localMinIndexes(prices)

    return Math.max(
        ...maximas.map(max => [Math.min(...prices.slice(0, max)), prices[max]])
            .filter(([a, _]) => a !== undefined)
            .map(([a, b]) => b - a)
    ) ?? 0
}

export function stockTraderTwo(prices: number[]): number {
    var maximas = localMaxIndexes(prices)
    var minimas = localMinIndexes(prices)

    // Remove maximas preceding first minima
    maximas = maximas.filter(i => i >= minimas[0])
    // Remove minimas proceeding last maxima
    minimas = minimas.filter(i => i <= maximas.slice(-1)[0])
    console.log('filtered maximas', maximas)
    console.log('filtered minimas', minimas)

    var result = 0
    for (const i in minimas) {
        result += prices[maximas[i]] - prices[minimas[i]]
    }

    return result
}

export function localMaxIndexes(numbers: number[]): number[] {
    function isLocalMax(index: number) {
        switch (index) {
            // Last number
            case numbers.length - 1: return numbers[index] > numbers[index - 1]
            // First number
            case 0: return numbers[index] >= numbers[index + 1]
            // Others
            default: return numbers[index] >= numbers[index + 1] && numbers[index] > numbers[index - 1]
        }
    }

    return range(0, numbers.length).filter(isLocalMax)
}

export function localMinIndexes(numbers: number[]): number[] {
    function isLocalMin(index: number) {
        switch (index) {
            // Last number
            case numbers.length - 1: return numbers[index] < numbers[index - 1]
            // First number
            case 0: return numbers[index] <= numbers[index + 1]
            // Others
            default: return numbers[index] <= numbers[index + 1] && numbers[index] < numbers[index - 1]
        }
    }

    return range(0, numbers.length).filter(isLocalMin)
}

export function maxProfit(prices: number[]) {

    const maximums = localMaxIndexes(prices)
    const minimums = localMinIndexes(prices)

    return maximums.map(i => prices[i]).reduce(add) - minimums.map(i => prices[i]).reduce(add)
}
