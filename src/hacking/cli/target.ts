import { BitBurner } from "Bitburner";
import { toTarget } from "../targeting";
import { writeTargets } from "/libs/ports.js";

export function autocomplete(data: any): string[] {
    return [...data.servers]
}

export async function main(ns: BitBurner) {
    await writeTargets(ns, ns.args.map(t => toTarget(ns, t)))
}