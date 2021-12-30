export interface GraphNode<T> {
    value: T
    connections: GraphNode<T>[]
}
