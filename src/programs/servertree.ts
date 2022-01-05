import { BitBurner } from "Bitburner";
import { printServerTree } from "/libs/lib.js";

export async function main(ns: BitBurner) {
    const maxPorts = ns.args[0]
    printServerTree(ns)
}