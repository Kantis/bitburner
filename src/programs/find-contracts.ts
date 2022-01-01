import { BitBurner } from "Bitburner";
import { deepscan } from "/libs/lib.js";

export async function main(ns: BitBurner) {
    const servers = deepscan(ns)

    var anyContract = false
    for (const s of servers.flatten()) {
        const contracts = ns.ls(s.name, '.cct')
        for (const c of contracts) {
            anyContract = true
            ns.tprintf('%-20s %s', s.name, c)
        }
    }

    if (!anyContract) {
        ns.tprintf('No contracts found')
    }
}