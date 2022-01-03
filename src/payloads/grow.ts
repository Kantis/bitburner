import { BitBurner } from "Bitburner";

export async function main(ns: BitBurner) {
    const target = ns.args[0]

    const targetTime = ns.args[1]
    if (targetTime !== undefined) {
        const executionTime = ns.getGrowTime(target)
        await ns.sleep(targetTime - (Date.now() + executionTime))
    }

    await ns.grow(target)
}