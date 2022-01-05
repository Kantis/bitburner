import { BitBurner, Host } from "Bitburner";
import { Payload } from "/hacking/payloads.js";

export async function main(ns: BitBurner) {
    async function distributeScripts(s: Host) {
        await ns.scp(Payload.All.map(p => p.file), 'home', s)
    }

    async function rigServer(maxFraction: number) {
        var ram = 20
        const availMoney = ns.getServerMoneyAvailable('home')
        ns.tprintf('Riggin server using max %.2f%% of available money', maxFraction * 100)

        while (ns.getPurchasedServerCost(Math.pow(2, ram)) > availMoney * maxFraction && ram > 0) {
            const cost = ns.getPurchasedServerCost(Math.pow(2, ram))
            // ns.tprintf('Cant afford server with 2^%d ram, trying next level. Cost: %20d - Have: %20d', ram, cost, money)
            ram--
        }

        ns.tprint(ram)
        const createdHost = ns.purchaseServer('hn', Math.pow(2, ram))
        ns.tprintf('%s created with %d GB ram', createdHost, ns.getServerMaxRam(createdHost))

        await distributeScripts(createdHost)
    }

    rigServer(ns.args[0] ?? 1.0)
}    