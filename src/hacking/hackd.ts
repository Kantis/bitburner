import { BitBurner as NS, Host, Script } from 'Bitburner'
import { deepscan } from '/libs/scan.js'
import { maxThreads } from '/libs/lib.js'
import { Analyzer, emptyCount, HackCounts, calculateMemoryCost } from '/hacking/Analyzer.js'
import { HackTarget } from '/libs/types.t.js'
import { nextSecond } from '/libs/std.js'
import { Payload } from '/hacking/payloads.js'
import { getReservedMemory, readTargets } from '/libs/ports.js'

interface HostAndRam {
	name: string
	freeRam: number
}

/** @param {NS} ns **/
export async function main(ns: NS) {
	function hasHackScripts(server: Host) {
		return ns.ls(server, 'hack.js').length > 0
	}

	function availableServers(): HostAndRam[] {
		return deepscan(ns)
			.flatten()
			.filter(hasHackScripts)
			.filter(ns.hasRootAccess)
			.map(s => ({
				name: s,
				freeRam: ns.getServerMaxRam(s) - ns.getServerUsedRam(s)
			}))
		//.filter(s => s.name != 'home')
	}

	function startScript(script: Script, hostname: Host, target: Host, threads: number, targetTime: number) {
		const actualThreads = Math.min(maxThreads(ns, hostname, script), threads)

		if (actualThreads < threads) {
			ns.tprintf('WARN [%s]: Running %s with %.2f threads instead of scheduled: %.2f', hostname, script, actualThreads, threads)
		}

		if (actualThreads > 0) {
			ns.exec(script, hostname, actualThreads, target, targetTime, hostname);
		}

		return actualThreads
	}

	function runScripts(hostname: Host, hacks: HackCounts[], targetTime: number) {
		hacks.forEach(count => {
			const target = count.host
			startScript(Payload.Hack.file, hostname, target, count.hack, targetTime)
			startScript(Payload.Grow.file, hostname, target, count.grow, targetTime + 1)
			startScript(Payload.Weaken.file, hostname, target, count.weaken, targetTime + 2)
		})
	}

	const analyzer = new Analyzer(ns)

	ns.disableLog('ALL')
	ns.tprintf('Starting hack daemon v2.0-RC1');

	(await readTargets(ns)).forEach((item: HackTarget) => {
		// printCount(ns, item)
		ns.tprintf('%-20s %.2f', item.host, item.score)
	});

	const untilNextFullSecond = nextSecond(Date.now()) - Date.now()
	await ns.sleep(untilNextFullSecond)

	while (true) {
		const cycleStart = Date.now()

		// TODO: listTargets should return Host[] instead of HackCount[]
		const targets = await readTargets(ns)
		// const totals: Map<Host, HackCounts> = associateWith(targets.map(t => t.host), emptyCount)

		const totalFreeMem = Math.max(0, availableServers()
			.map(s => Math.floor(s.freeRam / 1.8) * 1.8).reduce((a, b) => a + b) - getReservedMemory(ns))

		var memUsed = 0
		var targetCounter = 0

		while (targetCounter < targets.length && memUsed / totalFreeMem < 0.5) {

			const target = targets[targetCounter++]
			var targetTime = Date.now() + target.minWeakenTime + 500
			const totalRun = analyzer.maximizeRun(target.host, totalFreeMem)
			// ns.print(JSON.stringify(totalRun))
			// printCount(ns, ns.print, totalRun)
			const requiredMem = calculateMemoryCost(totalRun)

			if (requiredMem >= (totalFreeMem - memUsed)) {
				continue
			}

			if (totalRun.grow == 0 && totalRun.hack == 0 && totalRun.weaken == 0 && totalFreeMem > 5) {
				ns.print(ns.sprintf('WARN: Generated empty run on %s. Consider allowing more targets. (Free mem: %.2f)', target.host, totalFreeMem))
			} else if (requiredMem < totalFreeMem) {
				// ns.tprintf('Should run %d', runsToRun)
				const toRun = new Map<Host, HackCounts[]>()

				availableServers()
					.sort((a, b) => b.freeRam - a.freeRam)
					.filter(s => s.freeRam >= 1.8)
					.forEach(s => {
						var free = s.freeRam
						if (s.name == 'home') {
							free -= getReservedMemory(ns)
						}

						if (free >= 1.75) {
							// ns.print(ns.sprintf('Scheduling %s [%.2f GB]', s.name, free))
							const run = emptyCount(target.host)

							// Step 1: Schedule grows
							run.grow = Math.min(totalRun.grow, Math.floor(free / Payload.Grow.requiredRam))
							totalRun.grow -= run.grow
							free -= run.grow * Payload.Grow.requiredRam

							// Step 2: Schedule weakens
							run.weaken = Math.min(totalRun.weaken, Math.floor(free / Payload.Weaken.requiredRam))
							totalRun.weaken -= run.weaken
							free -= run.weaken * Payload.Weaken.requiredRam

							run.hack = Math.min(totalRun.hack, Math.floor(free / Payload.Hack.requiredRam))
							totalRun.hack -= run.hack
							free -= run.hack * Payload.Hack.requiredRam

							memUsed += calculateMemoryCost(run)

							toRun.set(s.name, [run])
						}
					})

				toRun.forEach((hacks, host) => runScripts(host, hacks, targetTime))

			} else {
				ns.tprintf('Cant fit run into memory. %.2f GB available, required %.2f GB', totalFreeMem, calculateMemoryCost(totalRun))
			}
		}

		ns.print(ns.sprintf('Cycle execution time %.2f', Date.now() - cycleStart))
		await ns.sleep(250)
	}
}