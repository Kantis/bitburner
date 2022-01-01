import { BitBurner as NS, Host } from 'Bitburner'
import { deepscan, freeRam, maxThreads } from '/libs/lib.js'
import { add, Analyzer, emptyCount, HackCounts, printCount } from '/hacking/analyze.js'
import { listTargets, score } from '/hacking/targeting.js'
import { associateBy, associateWith } from '/libs/std.js'

const HOME_RESERVED_RAM = 10

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
	const analyzer = new Analyzer(ns)

	function availableServers() {
		return deepscan(ns).flatten().filter(s => ns.hasRootAccess(s.name))
		//.filter(s => s.name != 'home')
	}

	function startScript(script: Script, hostname: Host, target: Host, threads: number) {
		const actualThreads = Math.min(maxThreads(ns, hostname, script.name), threads)

		if (actualThreads < threads) {
			ns.tprintf('WARN: Running %s with %d threads instead of scheduled: %d', script.name, actualThreads, threads)
		}

		if (actualThreads > 0) {
			ns.exec(script.name, hostname, actualThreads, target);
		}

		return actualThreads
	}

	function runScripts(hostname: Host, hacks: HackCounts[]) {
		hacks.forEach(count => {
			startScript(Script.Hack, hostname, count.host, count.hack)
			startScript(Script.Grow, hostname, count.host, count.grow)
			startScript(Script.Weaken, hostname, count.host, count.weaken)
		})
	}

	async function distributeScripts() {
		for (const s of availableServers()) {
			await ns.scp(['grow.js', 'hack.js', 'weaken.js'], 'home', s.name)
		}
	}

	function nextScript(scheduled: HackCounts, limit: HackCounts): (Script | undefined) {
		// printCount(ns, scheduled)
		// printCount(ns, limit)
		const actualLimits = analyzer.analyzeActualLimit(scheduled, limit)

		// printCount(ns, actualLimits)

		if (scheduled.weaken < actualLimits.weaken) return Script.Weaken
		if (scheduled.grow < actualLimits.grow) return Script.Grow
		if (scheduled.hack < actualLimits.hack) return Script.Hack
		return undefined
	}

	function printCooldown(v: number, k: Host) {
		ns.tprintf('%-20s %5.2f', k, v - Date.now())
	}

	ns.disableLog('ALL')
	ns.tprint('Starting hack daemon')

	const cooldowns = new Map<Host, number>();

	(await listTargets(ns)).forEach((item: HackCounts) => {
		printCount(ns, item)
		ns.tprintf('%-20s %.2f', item.host, score(ns, item.host))
	});

	while (true) {
		await distributeScripts()

		const targets = (await listTargets(ns)).filter(t => (cooldowns.get(t.host) ?? 0) < Date.now())
		const scheduled: HackCounts[] = (await listTargets(ns)).map(target => { return { host: target.host, hack: 0, grow: 0, weaken: 0 } })

		// ns.tprint('Valid targets: ' + JSON.stringify(targets.map(t => [t.host, (cooldowns.get(t.host) ?? 0) < Date.now()])))
		// cooldowns.forEach(printCooldown)

		var targetCounter = 0
		var target = targets[targetCounter]
		const totals: Map<Host, HackCounts> = associateWith(targets.map(t => t.host), emptyCount)

		availableServers().forEach(s => {
			const toRun = new Map<Host, HackCounts>()

			var free = freeRam(ns, s.name)
			if (s.name == 'home') free -= HOME_RESERVED_RAM

			while (free > 0) {
				if (target === undefined) {
					// ns.tprint('ERR: No available target')
					break
				}

				var script = nextScript(
					add(toRun.get(target.host) ?? emptyCount(target.host),
						totals.get(target.host)!!),
					target
				)

				while (script === undefined && targetCounter < targets.length) {
					target = targets[targetCounter++]
					script = nextScript(add(toRun.get(target.host) ?? emptyCount(target.host), totals.get(target.host)!!), target)
					// ns.tprintf('next script: %s', script?.name)
				}

				if (toRun.get(target.host) === undefined) {
					toRun.set(target.host, emptyCount(target.host))
				}

				if (script === undefined) break
				const cost = ns.getScriptRam(script.name)

				if (free < cost) break

				switch (script) {
					case Script.Hack:
						toRun.get(target.host)!!.hack += 1
						break
					case Script.Grow:
						toRun.get(target.host)!!.grow += 1
						break
					case Script.Weaken:
						toRun.get(target.host)!!.weaken += 1
						break
				}

				free -= cost
			}

			toRun.forEach(t => {
				totals.set(t.host, add(t, totals.get(target.host)!!))
			})

			runScripts(s.name, [...toRun.values()])
		})

		totals.forEach((count) => {
			if (count.hack > 0) {
				// printCount(ns, count)
				// ns.tprint('Setting cooldown for ' + count.host)
				cooldowns.set(count.host, analyzer.cooldown(count.host))
			}
		})

		await ns.sleep(1000)
	}
}