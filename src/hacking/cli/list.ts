import { Server, toServer } from '/libs/lib.js'
import { BitBurner as NS } from 'Bitburner'
import { Column, printTable } from '/libs/table.js'
import { listTargets, score } from '/hacking/targeting.js'

/** @param {NS} ns **/
export async function main(ns: NS) {
    const targets = (await listTargets(ns)).map(s => toServer(ns, s.host))

    const columns: Column<Server>[] = [
        {
            label: 'Name',
            width: 24,
            extractor: s => s.name,
            alignment: 'Left'
        }, {
            label: '$$$',
            width: 18,
            extractor: s => ns.sprintf(
                '%7s (%5.1f)', 
                ns.nFormat(s.maxMoney, '0.0a'), 
                ns.getServerMoneyAvailable(s.name) /s.maxMoney * 100.0
            )
        }, {
            label: 'Score',
            width: 7,
            extractor: s => String(Math.round(score(ns, s.name)))
        }, {
            label: 'Security',
            width: 12,
            extractor: s => ns.sprintf('%5.1f (%d)', ns.getServerSecurityLevel(s.name), s.minSecurity)
        }
    ]

    printTable(targets, columns, ns.tprintf)
}