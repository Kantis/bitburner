import { BitBurner, Host } from "Bitburner";

const minGrowThreshold = 1.05

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
        let avail = this.ns.getServerMoneyAvailable(target)
        if (avail < 100) return 1e9
        let maxFactor = this.ns.getServerMaxMoney(target) / this.ns.getServerMoneyAvailable(target)
        if (maxFactor < minGrowThreshold) return 0
        return this.ns.growthAnalyze(target, maxFactor)
    }


    requiredGrowsPerHack(target: Host) {
        return this.ns.growthAnalyze(target, 1.0 + this.ns.hackAnalyze(target))
    }

    requiredWeakenPerHack() {
        return -1.0 * this.ns.hackAnalyzeSecurity(1) / this.securityPerWeaken
    }

    requiredWeakenPerGrow() {
        let result = -1.0 * this.ns.growthAnalyzeSecurity(1) / this.securityPerWeaken * 10.0 // Temp 2x modifier , since sec is rising
        return result
    }
}