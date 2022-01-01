import { BitBurner, Host } from "Bitburner";
import { count } from "console";
import { Server } from "/libs/lib.js";

const minGrowThreshold = 1.05
const allowHackThreshold = 1.4

export interface HackCounts {
    host: Host,
    hack: number,
    grow: number,
    weaken: number
}

export class Analyzer {
    private ns: BitBurner
    readonly securityPerWeaken: number

    constructor(ns: BitBurner) {
        this.ns = ns
        this.securityPerWeaken = Math.abs(ns.weakenAnalyze(1))
    }

    /**
     * Returns maximum allowed hacks to run in parallel towards a single target.
     * 
     * @param server the target to hack 
     */
    maxHacks(server: Host): number {
        const perThread = this.ns.hackAnalyze(server)
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

        return this.ns.growthAnalyze(target, maxFactor)
    }

    requiredGrowsPerHack(target: Host) {
        return this.ns.growthAnalyze(target, 1.0 + this.ns.hackAnalyze(target))
    }

    requiredWeakenPerHack() {
        return this.ns.hackAnalyzeSecurity(1) / this.securityPerWeaken
    }

    requiredWeakenPerGrow() {
        let result = this.ns.growthAnalyzeSecurity(1) / this.securityPerWeaken * 10.0 // Temp 2x modifier , since sec is rising
        return result
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
        const growsPerHack = this.requiredGrowsPerHack(host)
        const hacks = this.isHackAllowed(host) ? this.maxHacks(host) : 0
        const grows = this.isGrowAllowed(host) ? this.countGrows(host) : 0

        return {
            host: host,
            hack: hacks,
            grow: grows,
            weaken: this.countWeaken(host)
        }
    }

    analyzeActualLimit(scheduled: HackCounts, originalLimit: HackCounts): HackCounts {
        const target = scheduled.host

        return {
            host: target,
            hack: originalLimit.hack,
            grow: this.requiredGrowsPerHack(target) * scheduled.hack + originalLimit.grow,
            weaken: this.requiredWeakenPerHack() * scheduled.hack + this.requiredWeakenPerGrow() * scheduled.grow + originalLimit.weaken
        }
    }

    cooldown(host: Host): number {
        // this.ns.tprint('Weaken time: ' + this.ns.getWeakenTime(host))
        return Date.now() + this.ns.getWeakenTime(host)
    }
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

export function printCount(ns: BitBurner, count: HackCounts) {
    ns.tprintf('%-20s {weaken: %d, grow: %d, hack: %d}', count.host, count.weaken, count.grow, count.hack)
}