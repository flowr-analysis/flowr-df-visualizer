import { DataflowGraph } from "@eagleoutice/flowr";

export function transformToVisualizazionGraph(dataflowGraph: DataflowGraph): VisualizationGraph{
    
    const visualizationGraph: VisualizationGraph = {nodes:[], links: []}

    for(let [nodeId, nodeInfo] of dataflowGraph.vertices(true)){
        const newNode: VisualizationNode = {id: nodeId, name: nodeInfo.name, nodeType: nodeInfo.tag} 
        visualizationGraph.nodes.push(newNode)
    }

    for( let [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edges()){
        for(let [targetNodeId, targetNodeInfo] of listOfConnectedNodes){
            for( let linkEdgeType in targetNodeInfo.types){
                const newEdge: VisualizationEdge = {source: sourceNodeId, target: targetNodeId, edgeType: linkEdgeType}
                visualizationGraph.links.push(newEdge)
            }
        }
    }

    return visualizationGraph
}