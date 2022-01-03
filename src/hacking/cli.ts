import { BitBurner } from "Bitburner";
import { cli, Command } from "/libs/cli.js"

export function autocomplete(data: any, args: string[]) {
    return ['list', 'watch', 'exit', 'auto', 'reserve']
}

export async function main(ns: BitBurner) {
    const commands: Command[] = [
        { 
            invocation: 'list', 
            aliases: ['l'],
            description: 'prints a list of target servers', 
            script: '/hacking/cli/list.js'
        }, {
            invocation: 'watch', 
            aliases: ['w'],
            description: 'opens a watcher for owned stock', 
            script: '/stockmarket/watcher.js'
        }, {
            invocation: 'exit', 
            aliases: ['q', 'down'],
            description: 'disables auto hacking', 
            script: '/hacking/cli/exit.js'
        }, {
            invocation: 'auto', 
            aliases: ['up'],
            description: 'enables auto hacking', 
            script: '/hacking/hackd.js'
        }, {
            invocation: 'reserve',
            aliases: ['r'],
            description: 'reserves memory from being used by the hack daemon. Default 10 GB',
            script: '/hacking/cli/reserve.js'
        }
    ]
    
    cli(ns, commands)
}