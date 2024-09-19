import { EdgeTypeName } from '@eagleoutice/flowr/dataflow/graph/edge'
import type { Edge, Node } from '@xyflow/react'
import { TwoKeyMap } from '../utility/two-key-map'


export class VisualStateModel {
	readonly isGreyedOutMap: Map<string, boolean> = new Map<string, boolean>()
	isNodeIdShown:           boolean = false
	alteredGraph: ShownGraph = {nodes:[], edges:[]}
	originalGraph: ShownGraph = {nodes:[], edges:[]}
	alteredEdgeConnectionMap: TwoKeyMap<string,string, Set<EdgeTypeName>> = new TwoKeyMap<string,string, Set<EdgeTypeName>>()//source -> target
	originalEdgeConnectionMap: TwoKeyMap<string,string, Set<EdgeTypeName>> = new TwoKeyMap<string,string, Set<EdgeTypeName>>()//source -> target
	alteredReversedEdgeConnectionMap:TwoKeyMap<string,string, boolean> = new TwoKeyMap<string,string, boolean>() // target -> source
	originalReversedEdgeConnectionMap:TwoKeyMap<string,string, boolean> = new TwoKeyMap<string,string, boolean>() // target -> source
	alteredNodeChildrenMap: Map<string, string[]> = new Map<string, string[]>()//parent -> children
	originalNodeChildrenMap: Map<string, string[]> = new Map<string, string[]>()  //parent -> children
	nodeContainsReducedNodes: Map<string, string[]> = new Map<string, string[]>() //reductionNode -> deletedNodes
	reducedToNodeMapping: Map<string, string> = new Map<string, string>() // deletedNode -> reducedNode
	deletedEdges: TwoKeyMap<string, string, Edge[]> = new TwoKeyMap<string, string, Edge[]>() //
	combinedEdges: TwoKeyMap<string, string, EdgeInfo[]> = new TwoKeyMap<string, string, EdgeInfo[]>() //source,target, array of edges this edge is made of
	unCombinedDeletedEdges: TwoKeyMap<string, string, EdgeInfo> = new TwoKeyMap<string, string, EdgeInfo>() // Original Node
	deletedNodes: Map<string, Node> = new Map<string, Node>() //deleted Node -> original Node Object
	nodeCount: number = 0
}

export interface ShownGraph {
	nodes: Node[]
	edges: Edge[]
}

export interface EdgeInfo{
	source: string 
	target: string
	edgeTypes: Set<EdgeTypeName>
}