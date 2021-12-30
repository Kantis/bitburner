export class Tree<T> {
    private root: TreeNode<T>

    [Symbol.iterator](): Iterator<T> {
        throw new Error('not implemented yet')
        // yield root
    }

    constructor(root: TreeNode<T>) { 
        this.root = root
    }

    flatten(): T[] {
        return this.flattenNode(this.root)
    }

    path(matcher: (node: TreeNode<T>) => boolean, current: TreeNode<T> = this.root): (TreeNode<T>[] | undefined) {
        if (matcher(current)) return [current]
        
        for (const child of current.children) {
            const childPath = this.path(matcher, child)
            if (childPath !== undefined) return [current, ...childPath]
        }

        return undefined
    }

    private flattenNode(node: TreeNode<T>): T[] {
        let children: T[] = node.children.flatMap(c => this.flattenNode(c))
        return [node.value, ...children]
    }
}

export interface TreeNode<T> {
    value: T
    children: TreeNode<T>[]
}

export function buildTree<T>(root: T, childrenFn: () => TreeNode<T>[]): TreeNode<T> {
    return {
        value: root,
        children: childrenFn()
    }
}