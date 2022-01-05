import { BitBurner } from "Bitburner";
import { hasTargets } from "/libs/ports.js";

export async function main(ns: BitBurner) {
    while (!hasTargets(ns)) {
        ns.tprintf('No targets found, running targeting')
        ns.run('/hacking/targeting.js', 1, '--write')
        await ns.sleep(250)
    }

    ns.tprintf('Starting hack daemon')
    ns.run('/hacking/hackd.js')
}