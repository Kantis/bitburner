import { BitBurner, Host } from "Bitburner";
import { Payload } from "/hacking/payloads.js";

const minGrowThreshold = 1.05
const allowHackThreshold = 1.4

export interface HackCounts {
    host: Host,
    hack: number,
    grow: number,
    weaken: number
}

const HACK_SECURITY = 0.002
const GROW_SEC = 0.004

export class Analyzer {
    private ns: BitBurner
    readonly securityPerWeaken: number

    constructor(ns: BitBurner) {
        this.ns = ns
        this.securityPerWeaken = 0.05 //Math.abs(ns.weakenAnalyze(1, 1)) // 1 GB
    }

    /**
     * Returns maximum allowed hacks to run in parallel towards a single target.
     * 
     * @param server the target to hack 
     */
    maxHacks(server: Host): number {
        const perThread = this.ns.hackAnalyze(server) // 1 GB
        return Math.max(0.5 / perThread, 1)
    }

    countWeaken(server: Host) {
        let currentSecurity = this.ns.getServerSecurityLevel(server)
        let minimumSecurity = this.ns.getServerMinSecurityLevel(server)
        const result = (currentSecurity - minimumSecurity) / this.securityPerWeaken
        return result
    }

    countGrows(target: Host) {
        let availableMoney = this.ns.getServerMoneyAvailable(target)
        if (availableMoney < 100) return 1e9

        let maxFactor = this.ns.getServerMaxMoney(target) / this.ns.getServerMoneyAvailable(target)
        if (maxFactor < minGrowThreshold) return 0

        return this.ns.growthAnalyze(target, maxFactor) // 1 GB
    }

    requiredGrowsPerHack(target: Host) {
        return this.ns.growthAnalyze(target, 1.0 + this.ns.hackAnalyze(target), 1)
    }

    requiredWeakenPerHack() {
        return 0.04 // this.ns.hackAnalyzeSecurity(1) / this.securityPerWeaken // 1 GB
    }

    requiredWeakenPerGrow() {
        // let result = this.ns.growthAnalyzeSecurity(1) / this.securityPerWeaken 
        return 0.08 // result
    }

    isHackAllowed(target: Host) {
        let maxFactor = this.ns.getServerMaxMoney(target) / this.ns.getServerMoneyAvailable(target)
        let result = maxFactor < allowHackThreshold && this.isGrowAllowed(target)
        return result
    }

    isGrowAllowed(target: Host) {
        return this.ns.getServerSecurityLevel(target) - this.ns.getServerMinSecurityLevel(target) < 10
    }

    analyzeLimit(host: Host): HackCounts {
        const hacks = this.isHackAllowed(host) ? this.maxHacks(host) : 0
        const grows = this.isGrowAllowed(host) ? this.countGrows(host) : 0

        return {
            host: host,
            hack: hacks,
            grow: grows,
            weaken: this.countWeaken(host)
        }
    }

    analyzeActualLimit(originalLimit: HackCounts, scheduled?: HackCounts): HackCounts {
        const target = originalLimit.host
        scheduled = scheduled ?? originalLimit

        return {
            host: target,
            hack: originalLimit.hack,
            grow: this.requiredGrowsPerHack(target) * scheduled.hack + originalLimit.grow,
            weaken: this.requiredWeakenPerHack() * scheduled.hack + this.requiredWeakenPerGrow() * scheduled.grow + originalLimit.weaken
        }
    }

    maximizeRun(target: Host, freeMemory: number): HackCounts {
        // this.ns.print(this.ns.sprintf('Maximizing run for %.2f GB memory', freeMemory))
        const result = emptyCount(target)

        result.weaken = Math.min(Math.ceil(this.countWeaken(target)), Math.floor(freeMemory / Payload.Weaken.requiredRam))
        freeMemory -= result.weaken * Payload.Weaken.requiredRam

        result.grow = Math.min(this.countGrows(target), Math.floor(freeMemory / (Payload.Grow.requiredRam + Math.ceil(this.requiredWeakenPerGrow() * Payload.Weaken.requiredRam))))
        result.weaken += Math.ceil(this.requiredWeakenPerGrow() * result.grow)
        freeMemory -= result.grow * Payload.Grow.requiredRam + result.grow * this.requiredWeakenPerGrow() * Payload.Weaken.requiredRam

        result.hack = Math.min(
            Math.floor(
                freeMemory /
                (
                    Payload.Hack.requiredRam +
                    Math.ceil(this.requiredGrowsPerHack(target)) * Payload.Grow.requiredRam +
                    Math.ceil(this.requiredWeakenPerHack() + this.requiredWeakenPerGrow() * this.requiredGrowsPerHack(target)) * Payload.Grow.requiredRam
                )
            ),
            this.maxHacks(target)
        )

        result.grow += Math.ceil(result.hack * this.requiredGrowsPerHack(target))
        result.weaken += Math.ceil(result.hack * (this.requiredWeakenPerHack() + this.requiredWeakenPerGrow() * this.requiredGrowsPerHack(target)))

        return result
    }
}

export function calculateMemoryCost(toRun: HackCounts) {
    return toRun.hack * Payload.Hack.requiredRam +
        toRun.grow * Payload.Grow.requiredRam +
        toRun.weaken * Payload.Weaken.requiredRam
}

export function add(a: HackCounts, b: HackCounts): HackCounts {
    return {
        host: a.host,
        hack: a.hack + b.hack,
        grow: a.grow + b.grow,
        weaken: a.weaken + b.weaken
    }
}

export function emptyCount(host: Host): HackCounts {
    return {
        host: host,
        hack: 0,
        grow: 0,
        weaken: 0
    }
}

export function printCount(ns: BitBurner, printFn: (msg: string) => void, count: HackCounts) {
    printFn(ns.sprintf('%-20s {weaken: %d, grow: %d, hack: %d}', count.host, count.weaken, count.grow, count.hack))
}