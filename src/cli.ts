import { BitBurner } from "Bitburner";
import { deepscan, printServerTree } from "/libs/lib.js";

export async function main(ns: BitBurner) {

    async function rigServer(name: string, maxMoney?: number) {
        const money = maxMoney ?? ns.getServerMoneyAvailable('home')
        var ram = 20

        while (ns.getPurchasedServerCost(Math.pow(2, ram)) > money && ram > 0) {
            const cost = ns.getPurchasedServerCost(Math.pow(2, ram))
            ns.tprintf('Couldnt afford server with 2^%d ram, trying next. Cost: %20d - Have: %20d', ram, cost, money)
            ram--
            await ns.sleep(100)
        }
        ns.tprint(ram)

        ns.purchaseServer(name, Math.pow(2, ram))
    }

    async function findContracts(ns: BitBurner) {
        const servers = deepscan(ns)

        for (const s of servers) {
            const contracts = ns.ls(s.name, '.cct')
            for (const c of contracts) {
                ns.tprintf('%-20s %s', s.name, c)
            }
        }
    }

    const cmd = ns.args[0]
    const otherArgs = ns.args.slice(1)

    switch (cmd) {
        case 'rig':
            rigServer(ns.args[1])
            break

        case 'fmem':
            ns.tprintf('%0.2f GB', ns.getServerMaxRam('home') - ns.getServerUsedRam('home'))
            break

        case 'print-servers':
            printServerTree(ns)
            break
        
        case 'find-contracts':
            findContracts(ns)
            break

        default:
            ns.tprintf("Unknown command '%s'", cmd)
            break
    }
}