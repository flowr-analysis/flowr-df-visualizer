import { Edge, Node } from '@xyflow/react';

export interface VisualizationGraph {
    nodesInfo: NodeInformation
    edges: Edge[]
}

export interface NodeInformation{
    nodes: Node[],
    nodeMap: Map<string, Node>
}