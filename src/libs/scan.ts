import { BitBurner, Host } from "Bitburner"
import { Tree, TreeNode } from "/libs/trees.js"

export function deepscan(ns: BitBurner): Tree<Host> {
    let visited: Host[] = ['home']

    function recurse(node: Host): TreeNode<Host>[] {
        let children = ns.scan(node)

        return children
            .filter(s => !visited.includes(s))
            .map(s => {
                visited.push(s)

                return {
                    value: s,
                    children: recurse(s)
                }
            })
    }

    return new Tree(
        {
            value: 'home',
            children: recurse('home')
        }
    )
}
