import { BitBurner, FactionName, Player } from "Bitburner";

const nonAutoJoinFactions: FactionName[] = [
    'Sector-12',
    'Aevum',
    'Volhaven',
    'Chongqing',
    'New Tokyo',
    'Ishima'
]

export async function main(ns: BitBurner) {

    function purchaseTorAndPrograms(player: Player, money: number): void {
        if (!player.tor && money > 1e6) {
            ns.purchaseTor()
        }

        if (player.tor && money > 1e6 && !ns.fileExists('BruteSSH.exe', 'home')) {
            if (ns.purchaseProgram('brutessh.exe')) {
                ns.tprintf('Purchased BruteSSH.exe')
            }
        }

        if (player.tor && money > 3e6 && !ns.fileExists('FTPCrack.exe', 'home')) {
            if (ns.purchaseProgram('ftpcrack.exe')) {
                ns.tprintf('Purchased FTPCrack.exe')
            }
        }

        if (player.tor && money > 1e7 && !ns.fileExists('relaySMTP.exe', 'home')) {
            if (ns.purchaseProgram('relaysmtp.exe')) {
                ns.tprintf('Purchased relaySMTP.exe')
            }
        }

        if (player.tor && money > 5e7 && !ns.fileExists('HTTPWorm.exe', 'home')) {
            if (ns.purchaseProgram('httpworm.exe')) {
                ns.tprintf('Purchased HTTPWorm.exe')
            }
        }

        if (player.tor && money > 5e8 && !ns.fileExists('SQLInject.exe', 'home')) {
            if (ns.purchaseProgram('sqlinject.exe')) {
                ns.tprintf('Purchased SQLInject.exe')
            }
        }
    }

    const isNotRunningOnHome = (script: string) => !ns.scriptRunning(script, 'home')
    const runOnHome = (script: string) => {
        ns.tprint('Starting ' + script)
        const pid = ns.run(script)
        ns.tail(pid)
    }

    function runDaemons(daemons: string[]) {
        daemons.filter(isNotRunningOnHome)
            .forEach(runOnHome)
    }

    ns.disableLog('getServerMoneyAvailable')
    ns.disableLog('sleep')

    ns.run('/hacking/targeting.js', 1, '--write')
    await ns.sleep(100)

    const factionOrder: FactionName[] = ['CyberSec', 'Tian Di Hui', 'NiteSec', 'The Black Hand', 'Chongqing', 'BitRunners']
    runDaemons(
        [
            '/event/hacked-server-daemon.js',
            '/hacking/hackd.js', 
            '/hacking/infectd.js'
        ]
    )

    while (true) {
        const player = ns.getPlayer()
        const money = ns.getServerMoneyAvailable('home')

        ns.checkFactionInvitations()
            .filter(s => nonAutoJoinFactions.indexOf(s) == -1)
            .forEach(ns.joinFaction)

        purchaseTorAndPrograms(player, money)

        ns.getCharacterInformation().company
        if (ns.getCharacterInformation().workRepGain >= 400_000) {
            ns.tprintf('WARN: Stopping work after achieving 400k rep')
            ns.stopAction()
            ns.workForFaction('BitRunners', 'hacking')
        }

        await ns.sleep(1000)
    }
}