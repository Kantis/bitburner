import { BitBurner, CodingContract, CodingContractTypes, Script } from "Bitburner";
import { spiralize } from "/cct/spiralize.js";
import { factorialize } from "/cct/largest-prime.js";
import { deepscan } from "/libs/scan.js";
import { Range, mergeOverlapping } from "/cct/merge-overlap.js";
import { maximumSubsum } from "/cct/subsum.js";
import { minTrianglePath } from "/cct/min-triangle-sum.js";
import { stockTraderFour, stockTraderOne, stockTraderTwo } from "/cct/buysell.js";
import { waysToSum } from "/cct/ways-to-sum.js";
import { pathsInGrid, solveFirst } from "/cct/paths-in-grid.js";

export async function main(ns: BitBurner) {
    const daemonMode = ns.args.includes('-d')
    const servers = deepscan(ns).flatten()

    const solvers = new Map<CodingContractTypes, (input: any) => any>()
    solvers.set('Find Largest Prime Factor', (i: number) => Math.max(...factorialize(i)))
    solvers.set('Spiralize Matrix', (i: any) => spiralize(i))
    solvers.set('Merge Overlapping Intervals', (i: Range[]) => mergeOverlapping(i))
    solvers.set('Subarray with Maximum Sum', (i: number[]) => maximumSubsum(i))
    solvers.set('Minimum Path Sum in a Triangle', (i: number[][]) => minTrianglePath(i))
    solvers.set('Total Ways to Sum', (input: number) => waysToSum(input))
    solvers.set('Algorithmic Stock Trader I', (i: number[]) => stockTraderOne(i))
    solvers.set('Algorithmic Stock Trader II', (i: number[]) => stockTraderTwo(i))
    solvers.set('Unique Paths in a Grid I', (i: any) => solveFirst(i))
    solvers.set('Unique Paths in a Grid II', (i: any) => pathsInGrid(i))

    const seenContracts: string[] = []

    ns.disableLog('scan')
    ns.disableLog('sleep')

    while (true) {
        for (const s of servers) {
            const contracts = ns.ls(s, '.cct').filter(s => !seenContracts.includes(s))

            for (const c of contracts) {
                ns.print(ns.sprintf('%-20s %s', s, c))

                const data = ns.codingcontract.getData(c, s)
                const type = ns.codingcontract.getContractType(c, s)
                const solver = solvers.get(type)

                if (solver !== undefined) {
                    const result = solver(data)
                    const solved = ns.codingcontract.attempt(result, c, s)
                    if (!solved) {
                        seenContracts.push(c)
                        ns.print(ns.sprintf('ERROR: Failed to solve coding contract on %s. Attempted to answer %s', s, result))
                        ns.tprintf('ERROR: Failed to solve coding contract on %s. Attempted to answer %s', s, result)
                    } else {
                        ns.print(ns.sprintf('SUCCESS: Solved [%s] contract on [%s]', type, s))
                        ns.tprintf('SUCCESS: Solved [%s] contract on [%s]', type, s)
                    }
                } else {
                    seenContracts.push(c)
                    ns.print(ns.sprintf('WARN: No solver implemented for %s', type))
                    ns.print(ns.codingcontract.getDescription(c, s))
                    ns.print(data)
                }
            }
        }

        if (!daemonMode) break
        await ns.sleep(60_000)
    }
}