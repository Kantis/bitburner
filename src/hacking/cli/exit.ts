import { BitBurner } from "Bitburner";

export async function main(ns: BitBurner) {
    ns.tprintf('Stopping hack daemon')

    const killed = ns.kill('/hacking/hackd.js', 'home')

    if (killed)  {
        ns.tprintf('Hack daemon stopped')
    } else {
        ns.tprintf('Failed to kill hack daemon. Was it running?')
    }
}