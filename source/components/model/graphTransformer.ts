import { Edge, Node } from "reactflow";
import { VisualizationGraph } from "./graph";
import { EdgeTypeName, edgeTypesToNames } from "@eagleoutice/flowr/dataflow/graph/edge";

export interface Graph {
    rootVertices: Set<string>,
    vertexInformation: Map<string, {name: string, tag: string}>,
    edgeInformation: Map<string, Map<string, {types: {[key: string]: string}}>>
}

export interface OtherGraph{
    "rootVertices": number[]
    "vertexInformation": [number, VertexInfo][]
    "edgeInformation": [number, [number, EdgeInfo][]][]
    "_idMap": IdMapInfo,
    "functionCache"?: any
}

export interface IdMapInfo{
    "size": number,
    "k2v": [number | string, VertexMapInfo][],
    "v2k": any
}

export interface VertexMapInfo{
    "type": string,
    "location"?: number[],
    "content"?: any,
    "lexeme"?: string,
    "info": any,
    "lhs"?: any,
    "rhs"?: any,
    "operator"?:any,
    "children"?: any
}

export interface VertexInfo{
    "tag": string,
    "id": number,
    "onlyBuiltin"?: boolean,
    "name"?: string,
    "environment"?: any,
    "when"?: string,
    "args"?:any
}

export interface EdgeInfo{
    "types": number,
    "attribute"?: string
}

export function transformToVisualizationGraph(dataflowGraph: Graph): VisualizationGraph {

    const visualizationGraph: VisualizationGraph = {nodes:[], edges: []}

    for(let [nodeId, nodeInfo] of dataflowGraph.vertexInformation.entries()){
        console.log(nodeId, nodeInfo);

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

export function transformToVisualizationGraphForOtherGraph(dataflowGraph: OtherGraph): VisualizationGraph {

    const infoMap = new Map<string, string>()

    dataflowGraph._idMap.k2v.forEach( ([index, key]) => {
        if(key.lexeme !== undefined){
            infoMap.set(String(index), key.lexeme)
        }
    })
    const visualizationGraph: VisualizationGraph = {nodes:[], edges: []}

    for(let [nodeId, nodeInfo] of dataflowGraph.vertexInformation){
        /* position will be set by the layout later */

        const nodeInfoInfo = nodeInfo
        const newNode: Node = {
            id: String(nodeId),
            data: {label: infoMap.get(String(nodeId)), when: nodeInfo.when},
            //data: { label: nodeInfoInfo.name, when: nodeInfoInfo.when},
            position: { x: 0, y: 0 },
            connectable: false,
            dragging: true,
            selectable: true,
            type: nodeTagMapper(nodeInfoInfo.tag)
        }
        visualizationGraph.nodes.push(newNode)
    }

    for( let [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation.entries()){
        const listOfConnectedNodes2 = listOfConnectedNodes[1]
        for(let [targetNodeId, targetNodeInfo] of listOfConnectedNodes2){
            console.log(edgeTypesToNames(targetNodeInfo.types))
             for( let linkEdgeType of edgeTypesToNames(targetNodeInfo.types)){
                const newEdge: Edge =
                    {
                        source: String(sourceNodeId),
                        target: String(targetNodeId),
                        id: `${sourceNodeId}-${targetNodeId}-${0}`,
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
    return nodeTagMap[type] ?? ''
}

const nodeTagMap:{[index: string]:string} = {
    'use':                  'useNode',
    'variable-definition':  'variableDefinitionNode',
    'function-call':        'functionCallNode',
    'function-definition':  'variableDefinitionNode', //for now definition nodes look the same (function as well as variable)
    'exit-point':           'exitPointNode'
}