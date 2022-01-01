import { BitBurner } from "Bitburner";
import { printOwnedStock } from "/stockmarket/shared.js";

export async function main(ns: BitBurner) {
    printOwnedStock(ns, ns.tprint) 
}