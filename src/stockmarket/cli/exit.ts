import { BitBurner } from "Bitburner";
import { liquidateAll, stopAutoTrader } from "/stockmarket/shared.js";

export async function main(ns: BitBurner) {
    liquidateAll(ns)
    stopAutoTrader(ns)
}