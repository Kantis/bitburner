import * as std from './std'
import { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns **/
export async function printHello(ns: NS) {
	ns.tprint('hello')
}

export function printServerTree(ns: NS) {
	let visited = Array<string>()
	function recurse(node: string, indent: number) {
		visited.push(node)
		let x = std.range(indent).map(i => ' ').reduce((a, b) => a + b, '')

		ns.tprintf('%s+ %s (diff: %d, ports: %d, ram: %d)', x, node, ns.getServerRequiredHackingLevel(node), ns.getServerNumPortsRequired(node), ns.getServerMaxRam(node))

		ns.scan(node)
			.filter(s => visited.indexOf(s) == -1)
			.forEach(s => recurse(s, indent + 2))
	}
	recurse('home', 0)
}

export interface Server {
	parent?: string,
	name: string,
	level: number,
	maxMoney: number,
	maxRam: number,
	minSecurity: number,
	growthParam: number
}

export function deepscan(ns: NS): Server[] {
	let servers = Array<Server>()

	function recurse(node: string) {
		let newServers = ns.scan(node)

		newServers
			.filter(s => servers.filter(x => x.name == s).length == 0)
			.forEach(s => {
				if (servers.filter(x => x.name == s).length == 0) {
					servers.push(
						{
							'parent': node,
							'name': s,
							'level': ns.getServerRequiredHackingLevel(s),
							'maxMoney': ns.getServerMaxMoney(s),
							'maxRam': ns.getServerMaxRam(s),
							'minSecurity': ns.getServerMinSecurityLevel(s),
							'growthParam': ns.getServerGrowth(s)
						}
					)
				}
				recurse(s)
			})
	}

	recurse('home')

	return std.uniq(servers)
}

export function findJuicyTarget(ns: NS, servers: Server[]) {
	servers
		.filter(s => isHackable(ns, s))
		.sort((a, b) => a.maxMoney - b.maxMoney)
		.forEach(s => {
			ns.tprintf('%20s %20d', s.name, s.maxMoney)
		})
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