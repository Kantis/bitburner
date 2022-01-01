import { BitBurner } from "Bitburner";
import { parseNumber, ShorthandNumber } from "/libs/std.js";

export const RESERVED_MONEY_PORT = 1

export function reserve(ns: BitBurner, amount: ShorthandNumber) {
    ns.clearPort(RESERVED_MONEY_PORT)
    ns.writePort(RESERVED_MONEY_PORT, parseNumber(amount))
}

export function getReservedMoney(ns: BitBurner): number {
    const fromPort = ns.peek(RESERVED_MONEY_PORT)
    if (isNaN(Number(fromPort))) {
        ns.tprintf('WARN: Invalid data on port: %d. Expected number but found %s', RESERVED_MONEY_PORT, fromPort)
        return parseNumber('10b')
    } else {
        ns.tprintf('INFO: Data from port %d: %s', RESERVED_MONEY_PORT, fromPort)
        return Number(fromPort)
    }
}