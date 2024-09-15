import type { Edge, Node } from '@xyflow/react'

export interface VisualizationGraph {
    nodesInfo: NodeInformation
    edgesInfo:     EdgeInformation
}

export interface NodeInformation{
    nodes:   Node[],
    nodeMap: Map<string, Node>
    nodeChildrenMap: Map<string, string[]> //parent -> children
}

export interface EdgeInformation{
    edges:     Edge[]
    edgeConnectionMap: Map<string, string[]> //source -> targets
}