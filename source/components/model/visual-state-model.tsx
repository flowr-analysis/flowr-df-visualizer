import type { Edge, Node } from '@xyflow/react'


export class VisualStateModel {
	readonly isGreyedOutMap: Map<string, boolean> = new Map<string, boolean>()
	isNodeIdShown:           boolean = false
	alteredGraph?: ShownGraph 
	originalGraph?: ShownGraph
  
}

export interface ShownGraph {
	nodes: Node[]
	edges: Edge[]
}