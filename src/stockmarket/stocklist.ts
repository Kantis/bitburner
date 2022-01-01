import { BitBurner as NS, StockSymbol } from 'Bitburner'
import { printOwnedStock } from '/stockmarket/shared.js'

/** @param {NS} ns **/
export async function main(ns: NS) {
    printOwnedStock(ns, ns.tprint)
}