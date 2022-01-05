import { BitBurner } from "Bitburner";
import { getReservedMoney, reserveMoney } from "/libs/ports.js";

export async function main(ns: BitBurner) {
    const toReserve = ns.args[0]

    if (toReserve === undefined) {
        ns.tprintf('Currently reserved: %s', ns.nFormat(getReservedMoney(ns), '0.0a'))
    } else {
        await reserveMoney(ns, ns.args[0])
    }
}