import { Host } from "Bitburner";

export interface HackTarget {
	host: Host
	score: number
	minWeakenTime: number
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
