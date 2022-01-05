import { BitBurner } from "Bitburner";
import { deepscan } from "/libs/scan.js";

export async function main(ns: BitBurner) {
    deepscan(ns)
        .path(s => s.value.toLowerCase() == ns.args[0].toLowerCase())
        ?.forEach(c => ns.connect(c.value))
}