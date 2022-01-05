import { BitBurner, Host } from 'Bitburner'
import { Analyzer } from '/hacking/Analyzer.js'
import { deepscan } from '/libs/scan.js'
import { HackTarget } from '/libs/types.t.js'
import { writeTargets } from '/libs/ports.js'


/**
 * 
 * @param ns BitBurner
 * @param host Host to score
 * @returns A score for the server, determining it's attractiveness for running hacks against. Higher is better
 */
export function score(ns: BitBurner, host: Host) {
	const analyzer = new Analyzer(ns)

	// calculate cycle length (millis)
	// calculate money per cycle
	// calculate ram per cycle
	// Score = money / (cycle length * ram per cycle)

	// We currently allow up to 50% of money to be stolen per cycle.. Perhaps this should be dynamic based on server growth instead
	const moneyPerCycle = 0.5 * ns.getServerMaxMoney(host)

	// Cycle length: HGW (Hack + gorw + weaken) = length of longest hack (weaken) at minimum sec
	const player = ns.getPlayer()
	const server = ns.getServer(host)
	server.hackDifficulty = server.minDifficulty
	const cycleLengthMillis = ns.formulas.hacking.weakenTime(server, player)

	// Ram = hacks to reach 50% stolen, grows to recover 50%, weakens to fix the hack and the grow
	const hacks = analyzer.maxHacks(host)
	const grows = analyzer.requiredGrowsPerHack(host) * hacks
	const weakens = analyzer.requiredWeakenPerHack() * hacks + analyzer.requiredWeakenPerGrow() * grows

	const totalRam = 1.75 * (hacks + grows + weakens)

	return 1000 * moneyPerCycle / (totalRam * cycleLengthMillis)
}

function minWeakenTime(ns: BitBurner, host: Host): number {
    const player = ns.getPlayer()
    const server = ns.getServer(host)
    server.hackDifficulty = server.minDifficulty
    return ns.formulas.hacking.weakenTime(server, player)
}

export function toTarget(ns: BitBurner, host: Host): HackTarget {
	return {
		host: host,
		score: score(ns, host),
		minWeakenTime: minWeakenTime(ns, host)
	}
}

/** @param {NS} ns **/
export async function listTargets(ns: BitBurner): Promise<HackTarget[]> {
	const canHaveMoney = (server: Host) => ns.getServerMaxMoney(server) > 0
	const byScoreDesc = (a: Host, b: Host) => score(ns, b) - score(ns, a)
	const analyzer = new Analyzer(ns)

	let servers = deepscan(ns).flatten()

	return servers
		.filter(ns.hasRootAccess)
		.filter(canHaveMoney)
		.sort(byScoreDesc)
		.map(s => toTarget(ns, s))
}

export async function main(ns: BitBurner) {
	const write = (ns.args[0] == '--write');

	const targets = await listTargets(ns)

	if (write) {
		await writeTargets(ns, targets)
	}

	targets.forEach(s => ns.tprintf('%-20s score: %d, minWtime: %.2f', s.host, s.score, s.minWeakenTime))
}