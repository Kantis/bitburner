import { BitBurner as NS, Host, Script } from 'Bitburner'
import { deepscan, maxThreads } from '/libs/lib.js'
import { Analyzer, emptyCount, HackCounts, printCount } from '/hacking/Analyzer.js'
import { listTargets, score } from '/hacking/targeting.js'
import { nextSecond } from '/libs/std.js'
import { Payload } from '/hacking/payloads.js'
import { nextTick } from 'process'
import { getReservedMemory } from '/libs/ports.js'

/** @param {NS} ns **/
export async function main(ns: NS) {
	const analyzer = new Analyzer(ns)

	function availableServers() {
		return deepscan(ns)
			.flatten()
			.filter(s => ns.hasRootAccess(s.name))
		//.filter(s => s.name != 'home')
	}

	function startScript(script: Script, hostname: Host, target: Host, threads: number, targetTime: number) {
		const actualThreads = Math.min(maxThreads(ns, hostname, script), threads)

		if (actualThreads < threads) {
			ns.tprintf('WARN [%s]: Running %s with %.2f threads instead of scheduled: %.2f', hostname, script, actualThreads, threads)
		}

		if (actualThreads > 0) {
			ns.exec(script, hostname, actualThreads, target, targetTime);
		}

		return actualThreads
	}

	function runScripts(hostname: Host, hacks: HackCounts[], targetTime: number) {
		hacks.forEach(count => {
			startScript(Payload.Hack.file, hostname, count.host, count.hack, targetTime)
			startScript(Payload.Grow.file, hostname, count.host, count.grow, targetTime + 1)
			startScript(Payload.Weaken.file, hostname, count.host, count.weaken, targetTime + 2)
		})
	}

	async function distributeScripts() {
		for (const s of availableServers()) {
			await ns.scp(Payload.All.map(p => p.file), 'home', s.name)
		}
	}

	ns.disableLog('ALL')
	ns.tprint('Starting hack daemon v2.0-ALPHA');

	(await listTargets(ns)).forEach((item: HackCounts) => {
		// printCount(ns, item)
		ns.tprintf('%-20s %.2f', item.host, score(ns, item.host))
	});

	while (true) {
		const cycleStart = Date.now()
		await distributeScripts()

		// TODO: listTargets should return Host[] instead of HackCount[]
		const targets = await listTargets(ns)
		// const totals: Map<Host, HackCounts> = associateWith(targets.map(t => t.host), emptyCount)

		const totalFreeMem = Math.max(0, availableServers()
			.map(s => Math.floor(s.freeRam / 1.8) * 1.8).reduce((a, b) => a + b) - getReservedMemory(ns))

		const target = targets[0]
		const targetTime = nextSecond(Date.now() + analyzer.minWeakenTime(target.host))
		const totalRun = analyzer.maximizeRun(target.host, totalFreeMem)
		ns.print(JSON.stringify(totalRun))
		printCount(ns, ns.print, totalRun)

		if (totalRun.grow == 0 && totalRun.hack == 0 && totalRun.weaken == 0 && totalFreeMem > 5) {
			ns.tprintf('WARN: Generated empty run on %s. Consider allowing more targets. (Free mem: %.2f)', target.host, totalFreeMem)
		} else if (analyzer.requiredMem(totalRun) < totalFreeMem) {
			availableServers()
				.sort((a, b) => b.freeRam - a.freeRam)
				.filter(s => s.freeRam >= 1.8)
				.forEach(s => {
					var free = s.freeRam
					if (s.name == 'home') {
						ns.print(ns.sprintf('Reserving %.2f GB ram on Home', getReservedMemory(ns)))
						free -= getReservedMemory(ns)
					}

					if (free >= 1.75) {
						ns.print(ns.sprintf('Scheduling %s [%.2f GB]', s.name, free))
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

						runScripts(s.name, [run], targetTime)
					}
				})
		} else {
			ns.tprintf('Cant fit run into memory. %.2f GB available, required %.2f GB', totalFreeMem, analyzer.requiredMem(totalRun))
		}

		ns.print(ns.sprintf('Execution millis: %.2fms', Date.now() - cycleStart))
		await ns.sleep(1000)
	}
}