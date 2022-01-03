import { Script } from "Bitburner"

export class Payload {
    static Weaken = new Payload('/payloads/weaken.js', 1.8)
    static Grow = new Payload('/payloads/grow.js', 1.8)
    static Hack = new Payload('/payloads/hack.js', 1.8)

    static All = [Payload.Weaken, Payload.Grow, Payload.Hack]

    readonly file: Script
    readonly requiredRam: number
    

    constructor(file: Script, requiredRam: number) {
        this.file = file
        this.requiredRam = requiredRam
    }
}