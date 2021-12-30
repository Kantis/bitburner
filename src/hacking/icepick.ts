import { BitBurner, Host } from "Bitburner"

/** @param {NS} ns **/
export async function main(ns: BitBurner) {
	const server = 'home'
	const target = ns.args[0]

	function remainingSec(target: Host) {
		return  ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)
	}

	while (remainingSec(target) > 0.1) {
		const availableRam = (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - 10)
		const scriptRam = ns.getScriptRam('weaken.js', server)
		const maxRequiredWeakens = remainingSec(target) / Math.abs(ns.weakenAnalyze(1))
		const threads = Math.min(maxRequiredWeakens, Math.floor(availableRam / scriptRam))

		if (threads > 0) {
			ns.exec('weaken.js', server, threads, target)
		}
		await ns.sleep(10_000)
	}

	ns.alert(ns.sprintf('%s broken!', target))
}