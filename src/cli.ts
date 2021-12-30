import { BitBurner } from "Bitburner";
import { deepscan, printServerTree } from "/libs/lib.js";

interface Command {
    invocation: string
    description: string
}

const commands = Array<Command>(
    { invocation: 'rig <name>', description: 'rigs a new server using as much money as possible' },
    { invocation: 'fmem', description: 'lists available memory on home' },
    { invocation: 'print-servers [host]', description: 'prints the network graph. If host is supplied, only prints the path to the host' },
    { invocation: 'find-contracts', description: 'lists servers having coding contracts on them' },
)

export async function main(ns: BitBurner) {

    async function rigServer(name: string, maxMoney?: number) {
        const money = maxMoney ?? ns.getServerMoneyAvailable('home')
        var ram = 20

        while (ns.getPurchasedServerCost(Math.pow(2, ram)) > money && ram > 0) {
            const cost = ns.getPurchasedServerCost(Math.pow(2, ram))
            ns.tprintf('Cant afford server with 2^%d ram, trying next level. Cost: %20d - Have: %20d', ram, cost, money)
            ram--
            await ns.sleep(100)
        }

        ns.tprint(ram)
        ns.purchaseServer(name, Math.pow(2, ram))
    }

    function findContracts(ns: BitBurner) {
        const servers = deepscan(ns)

        for (const s of servers.flatten()) {
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
            if (ns.args.length < 2) {
                ns.tprint('usage: rig <host>')
                return 1
            }
            await rigServer(ns.args[1])
            break

        case 'fmem':
            ns.tprintf('%0.2f GB', ns.getServerMaxRam('home') - ns.getServerUsedRam('home'))
            break

        case 'print-servers':
            printServerTree(ns)
            break

        case 'path':
            deepscan(ns).path(s => s.value.name == ns.args[1])?.forEach(c =>
                ns.tprint(c.value.name)
            )
            break

        case 'find-contracts':
            findContracts(ns)
            break

        default:
            ns.tprintf("Unknown command '%s'", cmd)
            ns.tprint('')
            ns.tprintf('Available commands: ')

            const longestInvocation = Math.max(...commands.map(c => c.invocation.length))

            commands.forEach(c => {
                ns.tprintf('- %-' + longestInvocation + 's : %s', c.invocation, c.description)
            })
            break
    }

    return 0
}