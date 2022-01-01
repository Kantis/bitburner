import { BitBurner } from "Bitburner";
import { deepscan } from "/libs/lib.js";

export async function main(ns: BitBurner) {
    const [total_used, total_max] =
        deepscan(ns)
            .flatten()
            .filter(s => ns.hasRootAccess(s.name))
            .map(s => [ns.getServerUsedRam(s.name), s.maxRam])
            .reduce((a: number[], b: number[]) => [a[0] + b[0], a[1] + b[1]])

    ns.tprintf('Global used memory: %d / %d GB ', total_used, total_max)
}