import { BitBurner } from "Bitburner";
import { printOwnedStock } from "/stockmarket/shared.js";

export async function main(ns: BitBurner) {
    while (true) {
        ns.clearLog()
        printOwnedStock(ns, ns.print)
        await ns.sleep(6000)
    }
}