import { deepscan } from '/libs/scan.js'
import { BitBurner as NS, Host } from 'Bitburner'
import { registerNewServer } from '/libs/ports.js'

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

	async function crackServer(s: Host) {
		if (hasBruteSsh()) { ns.brutessh(s) }
		if (hasFtpCrack()) { ns.ftpcrack(s) }
		if (hasRelaySmtp()) { ns.relaysmtp(s) }
		if (hasHttpWorm()) { ns.httpworm(s) }
		if (hasSqlInject()) { ns.sqlinject(s) }

		ns.nuke(s)
		ns.tprintf('Hacked %s', s)
		await registerNewServer(ns, s)
	}

	ns.tprintf('running infect with %d hacks', availablePortHacks())

	while (true) {
		const hackingLevel = ns.getHackingLevel()
		const servers = deepscan(ns)

		const crackableServers = servers
			.flatten()
			.filter(s => ns.getServerRequiredHackingLevel(s) <= hackingLevel)
			.filter(s => !ns.hasRootAccess(s))
			.filter(s => ns.getServerNumPortsRequired(s) <= availablePortHacks())

		for (const s of crackableServers) {
			await crackServer(s)
		}

		await ns.sleep(1000)
	}
}