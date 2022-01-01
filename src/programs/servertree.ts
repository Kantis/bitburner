import { BitBurner } from "Bitburner";
import { printServerTree } from "/libs/lib.js";

export async function main(ns: BitBurner) {
    printServerTree(ns)
}