import type { Edge, Node } from '@xyflow/react'


export class VisualStateModel {
	readonly isGreyedOutMap: Map<string, boolean> = new Map<string, boolean>()
	isNodeIdShown:           boolean = false
	alteredGraph?: ShownGraph 
	originalGraph?: ShownGraph
	alteredEdgeConnectionMap?: Map<string, string[]> //source -> targets
	originalEdgeConnectionMap?: Map<string, string[]>//source -> targets
	alteredNodeChildrenMap?: Map<string, string[]>   //parent -> children
	originalNodeChildrenMap?: Map<string, string[]>  //parent -> children
	nodeContainsReducedNodes?: Map<string, string[]> //reductionNode -> deletedNodes
	reducedToNodeMapping?: Map<string, string> // deletedNode -> reducedNode
}

export interface ShownGraph {
	nodes: Node[]
	edges: Edge[]
}