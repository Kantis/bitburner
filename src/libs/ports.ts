import { BitBurner } from "Bitburner";
import { parseNumber, ShorthandNumber } from "/libs/std.js";

const RESERVED_MONEY_PORT = 1
const RESERVED_MEMORY_PORT = 2

const defaultReserve = '10b'
const defaultReservedMemory = 10.0

export async function reserveMemory(ns: BitBurner, amount: number) {
    ns.clearPort(RESERVED_MEMORY_PORT)
    await ns.writePort(RESERVED_MEMORY_PORT, amount)
    ns.tprintf('Reserved %.2f GB memory on home', ns.peek(RESERVED_MEMORY_PORT))
}

export async function reserveMoney(ns: BitBurner, amount: ShorthandNumber) {
    ns.clearPort(RESERVED_MONEY_PORT)
    await ns.writePort(RESERVED_MONEY_PORT, parseNumber(amount))
}

export function getReservedMoney(ns: BitBurner): number {
    const fromPort = ns.peek(RESERVED_MONEY_PORT)
    if ('NULL PORT DATA' == fromPort) {
        return parseNumber(defaultReserve)
    } else if (isNaN(Number(fromPort))) {
        ns.tprintf('WARN: Invalid data on port: %d. Expected number but found %s', RESERVED_MONEY_PORT, fromPort)
        return parseNumber(defaultReserve)
    } else {
        // ns.tprintf('INFO: Data from port %d: %s', RESERVED_MONEY_PORT, fromPort)
        return Number(fromPort)
    }
}

export function getReservedMemory(ns: BitBurner): number {
    const fromPort = ns.peek(RESERVED_MEMORY_PORT)

    if ('NULL PORT DATA' == fromPort) {
        return defaultReservedMemory
    }

    if (isNaN(Number(fromPort))) {
        ns.tprintf('WARN: Invalid data on port: %d. Expected number but found %s', RESERVED_MEMORY_PORT, fromPort)
        return defaultReservedMemory
    }

    return Number(fromPort)
}