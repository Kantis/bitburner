import { BitBurner, FactionName } from "Bitburner";

const nonAutoJoinFactions: FactionName[] = [
    'Sector-12',
    'Aevum',
    'Volhaven',
    'Chongqing',
    'New Tokyo',
    'Ishima'
]

export async function main(ns: BitBurner) {

    while (true) {

        ns.checkFactionInvitations()
            .filter(s => nonAutoJoinFactions.indexOf(s) == -1)
            .forEach(ns.joinFaction)

        await ns.sleep(1000)
    }
}