import { BitBurner } from "Bitburner";
import { cli, Command } from "/libs/cli.js"

export async function main(ns: BitBurner) {
    const commands: Command[] = [
        { 
            invocation: 'list', 
            aliases: ['l'],
            description: 'prints a list of owned stock', 
            script: '/stockmarket/cli/list.js'
        }, {
            invocation: 'watch', 
            aliases: ['w'],
            description: 'opens a watcher for owned stock', 
            script: '/stockmarket/watcher.js'
        }, {
            invocation: 'exit', 
            aliases: ['q', 'down'],
            description: 'sells all owned stock and disables autotrading', 
            script: '/stockmarket/cli/exit.js'
        }, {
            invocation: 'auto', 
            aliases: ['up'],
            description: 'enables auto trading', 
            script: 'stockmarket/autotrader.js'
        }, {
            invocation: 'reserve',
            aliases: ['r'],
            description: 'reserves an amount from being used by the stock autotrader. Default 10b',
            script: '/stockmarket/cli/reserve.js'
        }
    ]
    
    cli(ns, commands)
}