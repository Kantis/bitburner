import { BitBurner, CodingContract, CodingContractTypes, Script } from "Bitburner";
import { spiralize } from "/cct/spiralize.js";
import { factorialize } from "/cct/largest-prime.js";
import { deepscan } from "/libs/lib.js";

export async function main(ns: BitBurner) {
    const servers = deepscan(ns)

    const solvers = new Map<CodingContractTypes, (input: any) => any>()
    solvers.set('Find Largest Prime Factor', (i: number) => Math.max(...factorialize(i)))
    solvers.set('Spiralize Matrix', (i: any) => spiralize(i))

    var anyContract = false
    for (const s of servers.flatten()) {
        const contracts = ns.ls(s.name, '.cct')
        for (const c of contracts) {
            anyContract = true
            ns.tprintf('%-20s %s', s.name, c)
            const data = ns.codingcontract.getData(c, s.name)
            const type = ns.codingcontract.getContractType(c, s.name)
            const solver = solvers.get(type)

            if (solver !== undefined) {
                const result = solver(data)
                const solved = ns.codingcontract.attempt(result, c, s.name)
                if (!solved) {
                    ns.tprintf('ERROR: Failed to solve coding contract on %s. Attempted to answer %s', s.name, result)
                } else {
                    ns.tprintf('SUCCESS: Solved [%s] contract on [%s]', type, s.name)
                }
            } else {
                ns.tprintf('WARN: No solver implemented for %s', type)
                ns.tprintf(ns.codingcontract.getDescription(c, s.name))
                ns.tprintf('%s', data)
            }
        }
    }
}