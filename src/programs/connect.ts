import { BitBurner } from "Bitburner";
import { deepscan } from "/libs/lib.js";

export async function main(ns: BitBurner) {
    deepscan(ns)
        .path(s => s.value.name.toLowerCase() == ns.args[0].toLowerCase())
        ?.forEach(c => ns.connect(c.value.name))
}