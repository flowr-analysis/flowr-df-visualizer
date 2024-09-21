import type { Edge, Node } from '@xyflow/react'
import { TwoKeyMap } from '../utility/two-key-map'
import { EdgeTypeName } from '@eagleoutice/flowr/dataflow/graph/edge'

export interface VisualizationGraph {
    nodesInfo: NodeInformation
    edgesInfo:     EdgeInformation
}

export interface NodeInformation{
    nodes:   Node[],
    nodeMap: Map<string, Node>
    nodeChildrenMap: Map<string, string[]> //parent -> children
    nodeCount:number
    rootNodes:string[]
}

export interface EdgeInformation{
    edges:     Edge[]
    edgeConnectionMap: TwoKeyMap<string,string, Set<EdgeTypeName>> //source -> target : value = Types
    reversedEdgeConnectionMap: TwoKeyMap<string,string,boolean> //target -> source
}