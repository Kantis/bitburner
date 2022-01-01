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
function stockTraderFour([transactions, prices]: [number, number[]]): number {
    const lowest = Math.min(...prices)
    const highest = Math.max(...prices)
    const lowestIndex = prices.indexOf(lowest)
    const highestIndex = prices.indexOf(highest)
    return 0
}

export function localMaxIndexes(numbers: number[]): number[] {
    function isLocalMax(index: number) {
        return (index == numbers.length - 1 || numbers[index] > numbers[index + 1]) && (index == 0 || numbers[index] > numbers[index - 1])
    }

    return range(numbers.length).filter(isLocalMax)
}

export function localMinIndexes(numbers: number[]): number[] {
    function isLocalMin(index: number) {
        return (index == numbers.length - 1 || numbers[index] < numbers[index + 1]) && (index == 0 || numbers[index] < numbers[index - 1])
    }

    return range(numbers.length).filter(isLocalMin)
}

export function maxProfit(prices: number[]) {

    const maximums = localMaxIndexes(prices)
    const minimums = localMinIndexes(prices)

    return maximums.map(i => prices[i]).reduce(add) - minimums.map(i => prices[i]).reduce(add)
}
