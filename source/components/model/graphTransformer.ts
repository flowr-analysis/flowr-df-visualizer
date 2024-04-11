import { Edge, Node } from "reactflow";
import { VisualizationGraph } from "./graph";

export interface Graph {
    rootVertices: Set<string>,
    vertexInformation: Map<string, {name: string, tag: string}>,
    edgeInformation: Map<string, Map<string, {types: {[key: string]: string}}>>
}


export function transformToVisualizationGraph(dataflowGraph: Graph): VisualizationGraph {

    const visualizationGraph: VisualizationGraph = {nodes:[], edges: []}

    for(let [nodeId, nodeInfo] of dataflowGraph.vertexInformation.entries()){
        /* position will be set by the layout later */
        const newNode: Node = {
            id: nodeId, 
            data: { label: nodeInfo.name}, 
            position: { x: 0, y: 0 }, 
            connectable: false, 
            dragging: true, 
            selectable: true, 
            type: nodeTagMapper(nodeInfo.tag) 
        }
        visualizationGraph.nodes.push(newNode)
    }

    for( let [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation.entries()){
        for(let [targetNodeId, targetNodeInfo] of listOfConnectedNodes){
            for( let linkEdgeType in targetNodeInfo.types){
                const newEdge: Edge =
                    {
                        source: sourceNodeId,
                        target: targetNodeId,
                        id: `${sourceNodeId}-${targetNodeId}-${linkEdgeType}`,
                        label: linkEdgeType,
                        data: { label: linkEdgeType, edgeType: linkEdgeType }
                    }
                visualizationGraph.edges.push(newEdge)
            }
        }
    }

    return visualizationGraph
}

function nodeTagMapper(type: string):string{
    switch(type){
        case 'use': return 'useNode'
        case 'variable-definition': return 'variableDefinitionNode'
        case 'function-call': return 'functionCallNode'
        case 'function-definition': return 'variableDefinitionNode' //for now definition nodes look the same (function as well as variable)
        case 'exit-point': return 'exitPointNode'
    }
    return ''
}