import * as lib from './lib'
import { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns **/
export async function main(ns: NS) {
    let servers = lib.deepscan(ns)
    
    ns.tprintf('+-----------------------+---------+----------+--------+----------+----------+')
    ns.tprintf('|   Name                |   $$$   | Hackable | Growth |  G.Time  | Security |')
    ns.tprintf('+-----------------------+---------+----------+--------+----------+----------+')

    servers
    .filter(s => ns.hasRootAccess(s.name))
    .sort((a, b) => ns.getServerMaxMoney(a.name) - ns.getServerMaxMoney(b.name))
    .forEach(s => {
        ns.tprintf(
            '| %-21s | %6dM | %8s | %6f | %7.0fs | %3d (%2d) |', 
            s.name, 
            ns.getServerMaxMoney(s.name) / 1000000, 
            ns.hasRootAccess(s.name) ? 'Y' : 'N',
            ns.getServerGrowth(s.name),
            ns.getGrowTime(s.name) / 1000,
            ns.getServerSecurityLevel(s.name),
            ns.getServerMinSecurityLevel(s.name),
        )
    })
    ns.tprintf('+-----------------------+---------+----------+--------+----------+---------+')
}