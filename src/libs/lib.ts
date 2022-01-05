import * as std from '/libs/std.js'
import { BitBurner as NS, Host } from 'Bitburner'
import { Tree, TreeNode } from '/libs/trees.js'
import { Server } from '/libs/types.t.js'

export function printServerTree(ns: NS, maxPorts?: number) {
	let visited = Array<string>()

	function recurse(node: string, indent: number) {
		visited.push(node)
		let x = std.range(0, indent).map(i => ' ').reduce((a, b) => a + b, '')

		const ports = ns.getServerNumPortsRequired(node)
		if (ports <= (maxPorts ?? 5)) {
			ns.tprintf('%s+ %s (diff: %d, ports: %d, ram: %d)', x, node, ns.getServerRequiredHackingLevel(node), ns.getServerNumPortsRequired(node), ns.getServerMaxRam(node))

			ns.scan(node)
				.filter(s => !visited.includes(s))
				.forEach(s => recurse(s, indent + 2))
		}
	}

	recurse('home', 0)
}

export function toServer(ns: NS, host: Host): Server {
	return {
		name: host,
		level: ns.getServerRequiredHackingLevel(host),
		maxMoney: ns.getServerMaxMoney(host),
		maxRam: ns.getServerMaxRam(host),
		freeRam: ns.getServerMaxRam(host) - ns.getServerUsedRam(host),
		minSecurity: ns.getServerMinSecurityLevel(host),
		growthParam: ns.getServerGrowth(host)
	}
}
export function isHackable(ns: NS, server: Server) {
	return ns.getHackingLevel() > server.level
}

export function printHackableServers(ns: NS, servers: Server[]) {
	servers.filter(s => isHackable(ns, s))
		.filter(s => !ns.hasRootAccess(s.name))
		.forEach(s => ns.tprint(s.name))
}

/** @param {NS} ns **/
export function freeRam(ns: NS, hostname: string) {
	return ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
}

/** @param {NS} ns **/
export function maxThreads(ns: NS, hostname: string, script: string) {
	const scriptRam = ns.getScriptRam(script)
	const availableRam = freeRam(ns, hostname)
	return Math.floor(availableRam / scriptRam)
}
