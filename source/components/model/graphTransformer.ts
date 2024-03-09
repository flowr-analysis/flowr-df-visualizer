export interface Graph {
    rootVertices: Set<string>,
    vertexInformation: Map<string, {name: string, tag: string}>,
    edgeInformation: Map<string, Map<string, {types: {[key: string]: string}}>>
}

export function transformToVisualizationGraph(dataflowGraph: Graph): VisualizationGraph{

    const visualizationGraph: VisualizationGraph = {nodes:[], links: []}

    for(let [nodeId, nodeInfo] of dataflowGraph.vertexInformation.entries()){
        const newNode: VisualizationNode = {id: nodeId, name: nodeInfo.name, nodeType: nodeInfo.tag, x: 10, y: 10}
        visualizationGraph.nodes.push(newNode)
    }

    for( let [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation.entries()){
        for(let [targetNodeId, targetNodeInfo] of listOfConnectedNodes){
            for( let linkEdgeType in targetNodeInfo.types){
                const newEdge: VisualizationEdge = {source: sourceNodeId, target: targetNodeId, edgeType: linkEdgeType}
                visualizationGraph.links.push(newEdge)
            }
        }
    }

    return visualizationGraph
}