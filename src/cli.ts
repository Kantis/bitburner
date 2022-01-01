import { BitBurner } from "Bitburner";
import { cli, Command } from "/libs/cli.js"

const commands: Command[] = [
    { 
        invocation: 'rig', 
        aliases: [],
        description: 'creates a new hn-server. Optional arg: max fraction of money to use, e.g. 0.5 to use maximum 50% of available money', 
        script: '/programs/rig.js'
    }, {
        invocation: 'fmem', 
        aliases: [],
        description: 'Lists free memory on a given server, or home if no argument supplied', 
        script: '/programs/fmem.js'
    }, {
        invocation: 'gmem', 
        aliases: [],
        description: 'shows global memory utilization', 
        script: '/programs/gmem.js'
    }, {
        invocation: 'path', 
        aliases: [],
        description: 'prints the path to a given server', 
        script: '/programs/path.js'
    }, {
        invocation: 'print-servers',
        aliases: ['pserv'],
        description: 'lists the hierarchy of servers',
        script: '/programs/servertree.js'
    }, {
        invocation: 'connect',
        aliases: ['c'],
        description: 'connects to the given server',
        script: '/programs/connect.js'
    }, {
        invocation: 'find-contracts',
        aliases: ['fc'],
        description: 'lists available contracts',
        script: '/programs/find-contracts.js'
    }
]

export function autocomplete(data: any, args: string[]) {
    if (args[0] === 'c' || args[0] === 'connect') {
        return [...data.servers]
    }    
    return []
}
    
export async function main(ns: BitBurner) {
    cli(ns, commands)
}
