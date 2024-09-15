import type { Edge, Node } from '@xyflow/react'


export class VisualStateModel {
	readonly isGreyedOutMap: Map<string, boolean> = new Map<string, boolean>()
	isNodeIdShown:           boolean = false
	alteredGraph?: ShownGraph 
	originalGraph?: ShownGraph
	alteredEdgeConnectionMap?: Map<string, string[]>
	originalEdgeConnectionMap?: Map<string, string[]>
	alteredNodeChildrenMap?: Map<string, string[]>
	originalNodeChildrenMap?: Map<string, string[]>
	nodeContainsReducedNodes?: Map<string, string[]>
	reducedToNodeMapping?: Map<string, string>
}

export interface ShownGraph {
	nodes: Node[]
	edges: Edge[]
}