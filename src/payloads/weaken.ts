import { BitBurner } from "Bitburner";

export async function main(ns: BitBurner) {
    const target = ns.args[0]
    const targetTime = ns.args[1]
    const host = ns.args[2]

    if (targetTime !== undefined) {
        const executionTime = ns.getWeakenTime(target)
        const delay = targetTime - (Date.now() + executionTime)
        if (delay < 0) {
            // ns.tprintf('ERROR [weaken@%s]: Tried to sleep for %.2fs', host, delay / 1000)
        }
        await ns.sleep(delay)
    }

    await ns.weaken(target)
}