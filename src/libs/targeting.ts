import { BitBurner, Host } from 'Bitburner'
import { deepscan } from '/libs/lib.js'

/** @param {NS} ns **/
export async function listTargets(ns: BitBurner) {
	const canHaveMoney = (server: Host) => ns.getServerMaxMoney(server) > 0
	const byMinSecurityLevelAscending = (a: Host, b: Host) => ns.getServerMinSecurityLevel(a) - ns.getServerMinSecurityLevel(b)
	
	let servers = deepscan(ns).map(s => s.name)
	
	servers.filter(canHaveMoney)
		.sort(byMinSecurityLevelAscending).forEach(s => ns.tprintf('%-20s %d', s, ns.getServerMinSecurityLevel(s)))
}