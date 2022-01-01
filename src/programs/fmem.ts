import { BitBurner } from "Bitburner";

export async function main(ns: BitBurner) {
    const server = ns.args[0] ?? 'home'
    ns.tprintf(
        '%s: %0.2f / %0.2f GB',
        server,
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server),
        ns.getServerMaxRam(server)
    )
}