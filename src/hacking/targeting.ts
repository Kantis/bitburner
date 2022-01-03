import { BitBurner, Host } from 'Bitburner'
import { Analyzer, HackCounts } from '/hacking/Analyzer.js'
import { deepscan } from '/libs/lib.js'


/**
 * 
 * @param ns BitBurner
 * @param host Host to score
 * @returns A score for the server, determining it's attractiveness for running hacks against. Higher is better
 */
export function score(ns: BitBurner, host: Host)  {
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

/** @param {NS} ns **/
export async function listTargets(ns: BitBurner): Promise<Array<HackCounts>> {
	const canHaveMoney = (server: Host) => ns.getServerMaxMoney(server) > 0
	const byScoreDesc = (a: Host, b: Host) => score(ns, b) - score(ns, a)
	const analyzer = new Analyzer(ns)

	let servers = deepscan(ns).flatten().map(s => s.name)

	return servers
		.filter(ns.hasRootAccess)
		.filter(canHaveMoney)
		.sort(byScoreDesc)
		.map(s => analyzer.analyzeLimit(s))
}

export async function main(ns: BitBurner) {
	(await listTargets(ns))
		.forEach(s => ns.tprintf('%-20s {weaken: %d, grow: %d, hack: %d}', s.host, s.weaken, s.grow, s.hack))
}