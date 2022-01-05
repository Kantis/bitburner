import { BitBurner } from "Bitburner";

export async function main(ns: BitBurner) {
    while (true) {
        ns.commitCrime('shoplift')

        while (ns.isBusy()) {
            await ns.sleep(1000)
        }

        await ns.sleep(10_000)
    }
}