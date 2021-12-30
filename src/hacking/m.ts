import { deepscan, freeRam, maxThreads } from '../libs/lib'
import { BitBurner as NS } from 'Bitburner'

const HOME_RESERVED_RAM = 10
const minGrowThreshold = 1.05
const allowHackThreshold = 1.4

class Script {
	static Weaken = new Script('weaken.js')
	static Grow = new Script('grow.js')
	static Hack = new Script('hack.js')

    public name: string

	constructor(name: string) {
		this.name = name
	}
}

/** @param {NS} ns **/
export async function main(ns: NS) {
	const target = ns.args[0]
	const securityPerWeaken = -1.0 * ns.weakenAnalyze(1)
	
	function countWeaken(hostname: string) {
		let currentSecurity = ns.getServerSecurityLevel(hostname)
		let minimumSecurity = ns.getServerMinSecurityLevel(hostname)
		ns.print(ns.sprintf('%3.2f ->> %3.2f', currentSecurity, minimumSecurity))
		const result = -1 * (currentSecurity - minimumSecurity) / securityPerWeaken
		ns.print(ns.sprintf('Result: %d', result))
		return result
	}

	function countGrows() {
		let avail = ns.getServerMoneyAvailable(target)
		if (avail < 100) return 1e9
		let maxFactor = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target)
		if (maxFactor < minGrowThreshold) return 0
		return ns.growthAnalyze(target, maxFactor)
	}

	function availableServers() {
		return deepscan(ns).filter(s => ns.hasRootAccess(s.name))
		//.filter(s => s.name != 'home')
	}

	function startScript(script: Script, hostname: string, threads: number) {
		const actualThreads = Math.min(maxThreads(ns, hostname, Script.Weaken.name), threads)
		// Never allow a single hack run to steal more than 5% of the target's money
		let maxHackThreads = 0.05 / ns.hackAnalyze(target)
		if (actualThreads > 0) {
			ns.exec(script.name, hostname, script == Script.Hack ? Math.min(actualThreads, maxHackThreads) : actualThreads, target);
		}

		return actualThreads
	}

	function runScripts(hostname: string, counts = { h: 0, g: 0, w: 0 }) {
		startScript(Script.Hack, hostname, counts.h)
		startScript(Script.Grow, hostname, counts.g)
		startScript(Script.Weaken, hostname, counts.w)
	}

	function requiredGrowsPerHack() {
		return ns.growthAnalyze(target, 1.0 + ns.hackAnalyze(target)) 
	}

	function requiredWeakenPerHack() {
		return -1.0 * ns.hackAnalyzeSecurity(1) / securityPerWeaken

	}

	function requiredWeakenPerGrow() {
		let result =-1.0 * ns.growthAnalyzeSecurity(1) / securityPerWeaken * 10.0 // Temp 2x modifier , since sec is rising
		return  result
	}

	async function ds() {
		for (const s of availableServers()) {
			await ns.scp(['grow.js', 'hack.js', 'weaken.js'], 'home', s.name)
		}
	}

	function isHackAllowed() {
		let maxFactor = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target)
		let result = maxFactor < allowHackThreshold && isGrowAllowed()
		ns.print('maxFactor: ' + maxFactor)
		ns.print('isHackAllowed: ' + result)
		return result
	}

	function isGrowAllowed() {
		return ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) < 10
	}

	function nextScript() {
		if (require.w >= 1.0) return Script.Weaken
		if (require.g >= 1.0) return Script.Grow
		return Script.Hack
	}

	function calcReq() {
		return {w: countWeaken(target), g: countGrows()}
	}
	
	var require = calcReq()
	let iteration = 0

	ns.enableLog('growthAnalyze')
	ns.disableLog('getServerMaxRam')
	ns.disableLog('getServerUsedRam')
	ns.disableLog('sleep')
	ns.disableLog('exec')

	while (true) {
		await ds()
		iteration++
		if (iteration % 10 == 0) {
			require = calcReq()
		}

		let canHack = isHackAllowed()
		let canGrow = isGrowAllowed()

		ns.print(ns.sprintf('Required: {h: 0, g: %.2f, w: %.2f}', require.g, require.w))

		availableServers().forEach(s => {
			const toRun = { h: 0, g: 0, w: 0 }
			var free = freeRam(ns, s.name)
			if (s.name == 'home') free -= HOME_RESERVED_RAM
			
			while (free > 0) {
				const script = nextScript()
				const cost = ns.getScriptRam(script.name)

				if (free < cost) break

				switch (script) {
					case Script.Hack:
						if (canHack) {
							toRun.h += 1
							require.w += requiredWeakenPerHack()
							require.g += requiredGrowsPerHack()
						}
						break
					case Script.Grow:
						if (canGrow) {
							toRun.g += 1
							require.w += requiredWeakenPerGrow()
							require.g -= 1
						}
						break
					case Script.Weaken:
						toRun.w += 1
						require.w -= 1
						break
				}

				free -= cost
			}

			runScripts(s.name, toRun)
		})
		
		await ns.sleep(1000)
	}
}