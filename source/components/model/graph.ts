interface VisualizationGraph {
    nodes: VisualizationNode[]
    links: VisualizationEdge[]
}

interface VisualizationNode {
    id: string
    name: string
    nodeType: string
    x: number,
    y: number
}

interface VisualizationEdge {
    source: string
    target: string
    edgeType: string
}