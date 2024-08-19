import type { Edge, Node } from '@xyflow/react'
import type { VisualizationGraph } from './graph'
import { edgeTypesToNames } from '@eagleoutice/flowr/dataflow/graph/edge'
import type { NodeId } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/node-id'
import type { ParentInformation } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/decorate'
import { visitAst } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/visitor'
import type { RNode } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/model'

export interface OtherGraph{
    'rootVertices':      number[]
    'vertexInformation': [number, VertexInfo][]
    'edgeInformation':   [number, [number, EdgeInfo][]][]
    '_idMap':            IdMapInfo,
    'functionCache'?:    any
}

export interface IdMapInfo{
    'size': number,
    'k2v':  [number | string, VertexMapInfo][],
    'v2k':  any
}

export interface VertexMapInfo{
    'type':      string,
    'location'?: number[],
    'content'?:  any,
    'lexeme'?:   string,
    'info':      any,
    'lhs'?:      any,
    'rhs'?:      any,
    'operator'?: any,
    'children'?: any
}

export interface VertexInfo{
    'tag':          string,
    'id':           number,
    'onlyBuiltin'?: boolean,
    'name'?:        string,
    'environment'?: any,
    'when'?:        string,
    'args'?:        any,
    'subflow'?:     SubFlowInfo
}

interface SubFlowInfo {
    'graph': number[]
}

export interface EdgeInfo{
    'types':      number,
    'attribute'?: string
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

export interface VisualizationNodeProps extends Record<string, unknown> {
    label:     string
    nodeType:  string
    extent?:   string
    parentId?: string
    children?: string[]
}


export function transformToVisualizationGraphForOtherGraph(ast: RNode<ParentInformation>, dataflowGraph: OtherGraph): VisualizationGraph {

	const infoMap = constructLexemeMapping(ast)

	const subflowMap = new Map<number, number>()

	const nodeIdMap = new Map<string, Node<VisualizationNodeProps>>()

	const visualizationGraph: VisualizationGraph = { nodesInfo: { nodes: [], nodeMap: nodeIdMap }, edges: [], }

	//Construct subflow Map and nodeId Map
	for(const [nodeId, nodeInfo] of dataflowGraph.vertexInformation){
		/* position will be set by the layout later */
		const nodeInfoInfo = nodeInfo
		if(nodeInfoInfo.tag ==='function-definition' && nodeInfoInfo.subflow !== undefined){
			const subflowArray = nodeInfoInfo.subflow.graph
			subflowArray.forEach((subNode) => {
				subflowMap.set(subNode,nodeId)
			})

			const idNewNode = String(nodeId) //+ '-subflow-node'
			const newNode: Node<VisualizationNodeProps> = {
				id:          idNewNode,
				data:        { label: infoMap.get(nodeId) ?? '', nodeType: nodeInfoInfo.tag, children: [], nodeCount: dataflowGraph.vertexInformation.length},
				position:    { x: 0, y: 0 },
				connectable: false,
				dragging:    true,
				selectable:  true,
				type:        nodeTagMapper(nodeInfoInfo.tag)
			}
			visualizationGraph.nodesInfo.nodes.push(newNode)
			nodeIdMap.set(idNewNode, newNode)
		}
	}

	//Construct Nodes
	for(const [nodeId, nodeInfo] of dataflowGraph.vertexInformation){
		/* position will be set by the layout later */
		const nodeInfoInfo = nodeInfo

		const idNewNode = String(nodeId)
		const newNode: Node<VisualizationNodeProps> = {
			id:          idNewNode,
			data:        { label: infoMap.get(nodeId) ?? '', nodeType: nodeInfoInfo.tag,  nodeCount: dataflowGraph.vertexInformation.length},
			position:    { x: 0, y: 0 },
			connectable: false,
			dragging:    true,
			selectable:  true,
			type:        nodeTagMapper(nodeInfoInfo.tag),
		}


		if(!nodeIdMap.has(idNewNode)){
			nodeIdMap.set(idNewNode, newNode)
			visualizationGraph.nodesInfo.nodes.push(newNode)
		}

		if(subflowMap.has(nodeId)){
			const toAlterNode = nodeIdMap.get(idNewNode)
			const parentId = String(subflowMap.get(nodeId))
            toAlterNode!.data = {
            	...toAlterNode!.data,
            	parentId: parentId,
            	extent:   'parent'
            }
            nodeIdMap.get(parentId)?.data.children?.push(idNewNode)
		}


		/*
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
            visualizationGraph.nodesInfo.nodes.push(newNode)
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
            visualizationGraph.nodesInfo.nodes.push(newNode)
            nodeIdMap.set(idNewNode, newNode)
        }
        */
	}

	//construct Edges
	for( const [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation){
		const listOfConnectedNodes2 = listOfConnectedNodes
		for(const [targetNodeId, targetNodeInfo] of listOfConnectedNodes2){
			const listOfEdgeTypes = edgeTypesToNames(targetNodeInfo.types)
			let labelNames:string = ''
			for( const linkEdgeType of listOfEdgeTypes){
				labelNames += linkEdgeType + ' '
			}
			const newEdge: Edge = {
				source: String(sourceNodeId),
				target: String(targetNodeId),
				id:     `edge-${sourceNodeId}-${targetNodeId}`,
				label:  labelNames,
				data:   { label: labelNames, edgeType: 'multiEdge' , edgeTypes: listOfEdgeTypes, nodeCount: dataflowGraph.vertexInformation.length }
			}
			visualizationGraph.edges.push(newEdge)
		}
	}
	return visualizationGraph
}

function nodeTagMapper(type: string):string{
	return nodeTagMap[type] ?? ''
}

const nodeTagMap:{[index: string]: string} = {
	'use':                 'useNode',
	'variable-definition': 'variableDefinitionNode',
	'function-call':       'functionCallNode',
	'function-definition': 'functionDefinitionNode',
	'exit-point':          'exitPointNode',
	'value':               'valueNode'
}
