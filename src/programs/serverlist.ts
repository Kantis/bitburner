import { deepscan } from '/libs/lib.js'
import { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns **/
export async function main(ns: NS) {
    let servers = deepscan(ns)

    ns.tprintf('+-----------------------+------------------+----------+--------+----------+------------+')
    ns.tprintf('|   Name                |        $$$       | Hackable | Growth |  W.Time  |  Security  |')
    ns.tprintf('+-----------------------+------------------+----------+--------+----------+------------+')

    servers
        .flatten()
        .filter(s => ns.hasRootAccess(s.name) && ns.getServerMaxMoney(s.name) > 0 )
        .sort((a, b) => ns.getServerMaxMoney(a.name) - ns.getServerMaxMoney(b.name))
        .forEach(s => {
            ns.tprintf(
                '| %-21s | %7s (%5.1f%%) | %8s | %6f | %7.0fs | %5.1f (%2d) |',
                s.name,
                ns.nFormat(ns.getServerMaxMoney(s.name), '0.0a'),
                ns.getServerMoneyAvailable(s.name) / ns.getServerMaxMoney(s.name) * 100.0,
                ns.hasRootAccess(s.name) ? 'Y' : 'N',
                ns.getServerGrowth(s.name),
                ns.getWeakenTime(s.name) / 1000,
                ns.getServerSecurityLevel(s.name),
                ns.getServerMinSecurityLevel(s.name),
            )
        })
    ns.tprintf('+-----------------------+------------------+----------+--------+----------+------------+')
}