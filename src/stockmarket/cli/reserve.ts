import { BitBurner } from "Bitburner";

export async function main(ns: BitBurner) {
    ns.tprint('Starting stock watcher')
    ns.spawn('/stockmarket/watcher.js', 1, '--tail')
}