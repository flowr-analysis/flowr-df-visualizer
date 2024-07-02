import { Edge, Node } from "reactflow";

export interface VisualizationGraph {
    nodesInfo: NodeInformation
    edges: Edge[]
}

export interface NodeInformation{
    nodes: Node[],
    nodeMap: Map<string, Node>
}