import { Edge, Node } from "reactflow";
import { VisualizationGraph } from "./graph";
import { EdgeTypeName, edgeTypesToNames } from "@eagleoutice/flowr/dataflow/graph/edge";
import { NodeId } from "@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/node-id";
import { NormalizedAst, ParentInformation } from "@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/decorate";
import { visitAst } from "@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/visitor";
import { RNode } from "@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/model";

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
    "args"?:any,
    "subflow"?: SubFlowInfo
}

interface SubFlowInfo {
    "graph": number[]
}

export interface EdgeInfo{
    "types": number,
    "attribute"?: string
}

export function transformToVisualizationGraph(dataflowGraph: Graph): VisualizationGraph {

    const visualizationGraph: VisualizationGraph = {nodes:[], edges: [], nodeMap: new Map<string, Node>()}

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


function constructLexemeMapping(ast: RNode<ParentInformation>): Map<NodeId, string> {
    const infoMap = new Map<NodeId, string>()
    visitAst(ast, node => {
        if(node.lexeme !== undefined){
            infoMap.set(node.info.id, node.lexeme)
        }
    })
    
    return infoMap
}

export interface VisualizationNodeProps{
    label: string
    nodeType:string
    parentId?: string
    children?: string[]
}


export function transformToVisualizationGraphForOtherGraph(ast: RNode<ParentInformation>, dataflowGraph: OtherGraph): VisualizationGraph {

    const infoMap = constructLexemeMapping(ast);

    const subflowMap = new Map<number, number>()

    const nodeIdMap = new Map<string, Node<VisualizationNodeProps>>()
    
    const visualizationGraph: VisualizationGraph = {nodes:[], edges: [], nodeMap:nodeIdMap}
    
    for(let [nodeId, nodeInfo] of dataflowGraph.vertexInformation){
        /* position will be set by the layout later */
        const nodeInfoInfo = nodeInfo
        if(nodeInfoInfo.tag ==='function-definition' && nodeInfoInfo.subflow !== undefined){
            const subflowArray = nodeInfoInfo.subflow.graph
            console.log(subflowArray)
            subflowArray.forEach((subNode) => {
                subflowMap.set(subNode,nodeId)
            })
            
            const idNewNode = String(nodeId) + '-subflow-node'
            const newNode: Node<VisualizationNodeProps> = {
                id: idNewNode,
                data: {label: infoMap.get(nodeId) ?? '', nodeType: 'group', children:[]},
                position: { x: 0, y: 0 },
                connectable: false,
                dragging: true,
                selectable: true,
                type: 'groupNode'
            }
            visualizationGraph.nodes.push(newNode)
            nodeIdMap.set(idNewNode, newNode)
        }
    }

    for(let [nodeId, nodeInfo] of dataflowGraph.vertexInformation){
        /* position will be set by the layout later */
        const nodeInfoInfo = nodeInfo
        if(subflowMap.has(nodeId)){
            const parentId = String(subflowMap.get(nodeId)) + '-subflow-node'
            const idNewNode = String(nodeId)
            const newNode: Node<VisualizationNodeProps> = {
                id: idNewNode,
                data: {label: infoMap.get(nodeId) ?? '', nodeType: nodeInfoInfo.tag, parentId:parentId},
                position: { x: 0, y: 0 },
                connectable: false,
                dragging: true,
                selectable: true,
                type: nodeTagMapper(nodeInfoInfo.tag)
            }
            visualizationGraph.nodes.push(newNode)
            nodeIdMap.set(idNewNode, newNode)
            nodeIdMap.get(parentId)?.data.children?.push(idNewNode)
        } else {
            const idNewNode = String(nodeId)
            const newNode: Node<VisualizationNodeProps> = {
                id: idNewNode,
                data: {label: infoMap.get(nodeId) ?? '', nodeType: nodeInfoInfo.tag},
                position: { x: 0, y: 0 },
                connectable: false,
                dragging: true,
                selectable: true,
                type: nodeTagMapper(nodeInfoInfo.tag),
            }
            visualizationGraph.nodes.push(newNode)
            nodeIdMap.set(idNewNode, newNode)
        }
    }

    for( let [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation){
        const listOfConnectedNodes2 = listOfConnectedNodes
        for(let [targetNodeId, targetNodeInfo] of listOfConnectedNodes2){
            const listOfEdgeTypes = edgeTypesToNames(targetNodeInfo.types)
            let labelNames:string = ''
            let lastEdgeType:string = ''
            for( let linkEdgeType of listOfEdgeTypes){
                labelNames += linkEdgeType + ' '
                lastEdgeType = linkEdgeType
            }
            const newEdge: Edge =
                    {
                        source: String(sourceNodeId),
                        target: String(targetNodeId),
                        id: `${sourceNodeId}-${targetNodeId}-${lastEdgeType}`,
                        label: labelNames,
                        data: { label: labelNames, edgeType: lastEdgeType }
                    }
                visualizationGraph.edges.push(newEdge)
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
    'exit-point':           'exitPointNode',
    'value':                'valueNode'
}