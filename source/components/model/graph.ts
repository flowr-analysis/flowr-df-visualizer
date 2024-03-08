interface VisualizationGraph {
    nodes: VisualizationNode[]
    links: VisualizationEdge[] 
}

interface VisualizationNode {
    id: string
    name: string
    nodeType: string
}

interface VisualizationEdge {
    source: string
    target: string
    edgeType: string
}