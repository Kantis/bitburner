import { BitBurner, Script } from "Bitburner"
import { firstOrNull } from "/libs/std.js"

export interface Command {
    invocation: string
    aliases?: string[]
    description: string
    script: Script
}

export function cli(ns: BitBurner, commands: Command[]) {
    const cmd = ns.args[0]

    const matchingCommand = firstOrNull(commands, it => cmd == it.invocation || it.aliases?.indexOf(cmd) !== -1)

    if (matchingCommand) {
        ns.run(matchingCommand.script, 1, ...ns.args.slice(1))
    } else {
        ns.tprintf("Unknown command '%s'", cmd)
        ns.tprint('')
        ns.tprintf('Available commands: ')

        const longestInvocation = Math.max(...commands.map(c => c.invocation.length))

        commands.forEach(c => {
            ns.tprintf('- %-' + longestInvocation + 's : %s', c.invocation, c.description)
        })
    }
}