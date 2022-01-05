import { BitBurner, Host, Port } from "Bitburner";
import { parseNumber, ShorthandNumber } from "/libs/std.js";
import { HackTarget, Server } from '/libs/types.t.js';
import { Tree } from "./trees";

const RESERVED_MONEY_PORT: Port = 1
const RESERVED_MEMORY_PORT: Port = 2
const TARGETING_PORT: Port = 3
const SERVERS_PORT: Port = 4
const NEW_HACKED_SERVER_PORT: Port = 5

const NULL_SYMBOL = 'NULL PORT DATA'

// PORT 1 - Reserved money (from Algorithmic trading etc)
const defaultMoneyReserve = '10b'

export async function reserveMoney(ns: BitBurner, amount: ShorthandNumber) {
    ns.clearPort(RESERVED_MONEY_PORT)
    await ns.writePort(RESERVED_MONEY_PORT, parseNumber(amount))
}

export function getReservedMoney(ns: BitBurner): number {
    const fromPort = ns.peek(RESERVED_MONEY_PORT)
    if (NULL_SYMBOL == fromPort) {
        return parseNumber(defaultMoneyReserve)
    } else if (isNaN(Number(fromPort))) {
        ns.tprintf('WARN: Invalid data on port: %d. Expected number but found %s', RESERVED_MONEY_PORT, fromPort)
        return parseNumber(defaultMoneyReserve)
    } else {
        // ns.tprintf('INFO: Data from port %d: %s', RESERVED_MONEY_PORT, fromPort)
        return Number(fromPort)
    }
}

// PORT 2 - Reserved memory 
const defaultReservedMemory = 10.0

export async function reserveMemory(ns: BitBurner, amount: number) {
    ns.clearPort(RESERVED_MEMORY_PORT)
    await ns.writePort(RESERVED_MEMORY_PORT, amount)
    ns.tprintf('Reserved %.2f GB memory on home', ns.peek(RESERVED_MEMORY_PORT))
}

export function getReservedMemory(ns: BitBurner): number {
    const fromPort = ns.peek(RESERVED_MEMORY_PORT)

    if (NULL_SYMBOL == fromPort) {
        return defaultReservedMemory
    }

    if (isNaN(Number(fromPort))) {
        ns.tprintf('WARN: Invalid data on port: %d. Expected number but found %s', RESERVED_MEMORY_PORT, fromPort)
        return defaultReservedMemory
    }

    return Number(fromPort)
}

// PORT 3 - Targeting data
export function hasTargets(ns: BitBurner): boolean {
    return ns.peek(TARGETING_PORT) !== NULL_SYMBOL
}

export async function writeTargets(ns: BitBurner, targets: HackTarget[]) {
    ns.clearPort(TARGETING_PORT)
    await ns.writePort(TARGETING_PORT, JSON.stringify(targets))
}

export async function readTargets(ns: BitBurner): Promise<HackTarget[]> {
    const fromPort = ns.peek(TARGETING_PORT)

    if (!hasTargets(ns)) {
        ns.tprintf('ERROR: No data on TARGETING PORT')
        ns.exit()
    }

    return JSON.parse(String(fromPort))
}


// PORT 4 - Server tree
export async function writeServerTree(ns: BitBurner, servers: Tree<Server>) {
    ns.clearPort(SERVERS_PORT)
    await ns.writePort(SERVERS_PORT, JSON.stringify(servers))
}

export async function readServerTree(ns: BitBurner): Promise<Tree<Server>> {
    const fromPort = ns.peek(TARGETING_PORT)

    if (!hasTargets(ns)) {
        ns.tprintf('ERROR: No data on TARGETING PORT')
        ns.exit()
    }

    return JSON.parse(String(fromPort))
}

// PORT 5 - Newly hacked servers
export async function registerNewServer(ns: BitBurner, host: Host) {
    const result = ns.tryWritePort(NEW_HACKED_SERVER_PORT, host)
    if (!result) ns.tprintf('ERROR: Failed to write %s to port: %d. Was likely full', host, NEW_HACKED_SERVER_PORT)
}

export async function getNewlyHackedServer(ns: BitBurner): Promise<(Host | undefined)> {
    const fromPort = ns.readPort(NEW_HACKED_SERVER_PORT)
    if (NULL_SYMBOL == fromPort) {
        return undefined
    } else if (typeof fromPort !== 'string' && !(fromPort instanceof String)) {
        ns.tprintf('Unknown data on port %d: %s', NEW_HACKED_SERVER_PORT, fromPort)
        return undefined
    }

    return String(fromPort)
}

