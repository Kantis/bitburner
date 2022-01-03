import { BitBurner } from "Bitburner";
import { reserveMoney } from "/libs/ports.js";

export async function main(ns: BitBurner) {
    await reserveMoney(ns, ns.args[0])
}