import { BitBurner } from "Bitburner";
import { getReservedMemory, reserveMemory } from "/libs/ports.js";

export async function main(ns: BitBurner) {
    ns.enableLog('ALL')

    if (ns.args[0] === undefined) {
        ns.tprintf('Currently reserved: %.2f GB', getReservedMemory(ns))
    } else {
        await reserveMemory(ns, ns.args[0])
    }
}