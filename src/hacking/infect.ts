import { deepscan } from '/libs/lib.js'
import { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns **/
export async function main(ns: NS) {

	type Hack =
		| 'BruteSSH.exe'
		| 'FTPCrack.exe'
		| 'relaySMTP.exe'
		| 'HTTPWorm.exe'
		| 'SQLInject.exe'

	function hasHack(h: Hack) {
		let theHack = ns.ls('home', h)
		return theHack.length > 0 && theHack[0].endsWith('exe')
	}

	function hasBruteSsh() { return hasHack('BruteSSH.exe') }
	function hasFtpCrack() { return hasHack('FTPCrack.exe') }
	function hasRelaySmtp() { return hasHack('relaySMTP.exe') }
	function hasHttpWorm() { return hasHack('HTTPWorm.exe') }
	function hasSqlInject() { return hasHack('SQLInject.exe') }

	function availablePortHacks() {
		var result = 0
		if (hasBruteSsh()) result++
		if (hasRelaySmtp()) result++
		if (hasFtpCrack()) result++
		if (hasSqlInject()) result++
		if (hasHttpWorm()) result++

		return result
	}

	ns.tprintf('running infect with %d hacks', availablePortHacks())

	while (true) {
		const hackingLevel = ns.getHackingLevel()
		const servers = deepscan(ns)

		servers
			.filter(s => s.level <= hackingLevel)
			.filter(s => !ns.hasRootAccess(s.name))
			.filter(s => ns.getServerNumPortsRequired(s.name) <= availablePortHacks())
			.forEach(s => {
				if (hasBruteSsh()) { ns.brutessh(s.name) }
				if (hasFtpCrack()) { ns.ftpcrack(s.name) }
				if (hasRelaySmtp()) { ns.relaysmtp(s.name) }
				if (hasHttpWorm()) { ns.httpworm(s.name) }
				if (hasSqlInject()) { ns.sqlinject(s.name) }

				ns.nuke(s.name)
				ns.tprintf('Hacked %s', s.name)
			})
		await ns.sleep(1000)
	}
}