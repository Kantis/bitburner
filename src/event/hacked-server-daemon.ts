import { BitBurner, Host } from "Bitburner";
import { Payload } from "/hacking/payloads.js";
import { getNewlyHackedServer } from "/libs/ports.js";
import { deepscan } from "/libs/scan.js";

export async function main(ns: BitBurner) {
    async function backdoorNewlyHackedServer(server: Host) {
        deepscan(ns)
            .path(s => s.value.toLowerCase() == server)
            ?.forEach(c => ns.connect(c.value))

        ns.tprintf('backdooring %s', server)
        await ns.installBackdoor()
        ns.connect('home')
    }

    async function distributeScripts(s: Host) {
        await ns.scp(Payload.All.map(p => p.file), 'home', s)
    }

    ns.disableLog('sleep')
    ns.tprintf('Starting Hacked-server daemon v0.1')

    while (true) {
        const newServer = await getNewlyHackedServer(ns)
        
        if (newServer !== undefined) {
            await distributeScripts(newServer)
            if (!newServer.startsWith('hn'))
                await backdoorNewlyHackedServer(newServer)
        }

        await ns.sleep(1000)
    }
}