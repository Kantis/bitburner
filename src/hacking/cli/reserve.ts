import { BitBurner } from "Bitburner";
import { reserveMemory } from "/libs/ports.js";

export async function main(ns: BitBurner) {
    ns.enableLog('ALL')
    await reserveMemory(ns, ns.args[0])
}