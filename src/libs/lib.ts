import * as std from '/libs/std.js'
import { BitBurner as NS, Host } from 'Bitburner'
import { Tree, TreeNode } from '/libs/trees.js'

export function printServerTree(ns: NS) {
	let visited = Array<string>()
	function recurse(node: string, indent: number) {
		visited.push(node)
		let x = std.range(0, indent).map(i => ' ').reduce((a, b) => a + b, '')

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
	freeRam: number,
	minSecurity: number,
	growthParam: number
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

export function deepscan(ns: NS): Tree<Server> {
	let visited: Host[] = ['home']


	function recurse(node: Host): TreeNode<Server>[] {
		let children = ns.scan(node)

		return children
			.filter(s => visited.filter(x => x == s).length == 0)
			.map(s => {
				visited.push(s)
				
				return {
					value: toServer(ns, s),
					children: recurse(s)
				}
			})
	}

	return new Tree(
		{
			value: { 
				name: 'home', 
				level: 0, 
				maxMoney: 0, 
				maxRam: ns.getServerMaxRam('home'), 
				freeRam: ns.getServerMaxRam('home') - ns.getServerUsedRam('home'),
				minSecurity: 100, 
				growthParam: 0 
			},
			children: recurse('home')
		}
	)
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
