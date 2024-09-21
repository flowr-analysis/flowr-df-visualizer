import type { Edge, Node } from '@xyflow/react'
import type { VisualizationGraph } from './graph'
import { EdgeTypeName, edgeTypesToNames } from '@eagleoutice/flowr/dataflow/graph/edge'
import type { NodeId } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/node-id'
import type { ParentInformation } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/decorate'
import { visitAst } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/visitor'
import type { RNode } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/model'
import { DataflowGraph } from '@eagleoutice/flowr/dataflow/graph/graph'
import { TwoKeyMap } from '../utility/two-key-map'

export interface OtherGraph{
    'rootVertices':      number[]
    'vertexInformation': [number, VertexInfo][]
    'edgeInformation':   [number, [number, EdgeInfoForImport][]][]
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
    'args'?:        ArgsInfo[],
    'subflow'?:     SubFlowInfo
}

export interface ArgsInfo{
	nodeId: number
}

interface SubFlowInfo {
    'graph': number[]
}

export interface EdgeInfoForImport{
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

	const visualizationGraph: VisualizationGraph = { nodesInfo: { nodes: [], nodeMap: nodeIdMap , nodeChildrenMap: new Map<string, string[]>(), nodeCount: 0, rootNodes: []}, edgesInfo: {edges:[], edgeConnectionMap: new TwoKeyMap<string,string, Set<EdgeTypeName>>(), reversedEdgeConnectionMap: new TwoKeyMap<string,string, boolean>()}, }

	//source, target, index
	const argumentIndexMap = new TwoKeyMap<number, number, number>()

	//Construct subflow Map and nodeId Map
	for(const [nodeId, nodeInfo] of dataflowGraph.vertexInformation){
		/* position will be set by the layout later */
		const nodeInfoInfo = nodeInfo
		if(nodeInfoInfo.tag ==='function-definition' && nodeInfoInfo.subflow !== undefined){
			const subflowArray = nodeInfoInfo.subflow.graph
			visualizationGraph.nodesInfo.nodeChildrenMap.set(String(nodeId), [])
			subflowArray.forEach((subNode) => {
				subflowMap.set(subNode,nodeId)
				const childrenArray = visualizationGraph.nodesInfo.nodeChildrenMap.get(String(nodeId))
				childrenArray?.push(String(subNode))
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
		} else if(nodeInfoInfo.tag ==='function-call' && nodeInfoInfo.args !== undefined){
			// set witch edges belong to each argument
			nodeInfoInfo.args.forEach(({nodeId:targetNodeId}, index) => {
				argumentIndexMap.set(nodeId, targetNodeId, index)
			})
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
	}

	console.log(visualizationGraph.nodesInfo.nodes)
	const edgeConnection = new Map<number, number[]>()
	const edgeConnectionString = new TwoKeyMap<string,string, Set<EdgeTypeName>>()
	const reversedEdgeConnection = new TwoKeyMap<string,string, boolean>()
	
	//Know EdgeConnections
	for( const [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation){
		const listOfConnectedNodes2 = listOfConnectedNodes
		for(const [targetNodeId] of listOfConnectedNodes2){
			if(!edgeConnection.has(sourceNodeId)){
				edgeConnection.set(sourceNodeId, [])
			}			
			edgeConnection.get(sourceNodeId)?.push(targetNodeId)
		}
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
			const isBidirectionalEdge = edgeConnection.get(targetNodeId)?.some((value) => (value === sourceNodeId)) ?? false
			const hasArgument = listOfEdgeTypes.has(EdgeTypeName.Argument)
			const newEdge: Edge = generateEdge(
				`edge-${sourceNodeId}-${targetNodeId}`,
				String(sourceNodeId),
				String(targetNodeId),
				isBidirectionalEdge,
				'multiEdge',
				listOfEdgeTypes,
				dataflowGraph.vertexInformation.length,
				hasArgument ? argumentIndexMap.get(sourceNodeId, targetNodeId) : undefined
			)
			
			edgeConnectionString.set(String(sourceNodeId), String(targetNodeId), listOfEdgeTypes)
			reversedEdgeConnection.set(String(targetNodeId), String(sourceNodeId), true)
			visualizationGraph.edgesInfo.edges.push(newEdge)
		}
	}

	//Remember Root Nodes
	dataflowGraph.rootVertices.forEach((nodeId) => {
		visualizationGraph.nodesInfo.rootNodes.push(String(nodeId))
	})

	//Remember nodeCount
	visualizationGraph.nodesInfo.nodeCount = dataflowGraph.vertexInformation.length

	//Remember EdgeConnection
	visualizationGraph.edgesInfo.edgeConnectionMap = edgeConnectionString
	visualizationGraph.edgesInfo.reversedEdgeConnectionMap = reversedEdgeConnection

	return visualizationGraph
}

export function generateEdge(id: string, source: string, target: string, isBidirectionalEdge: boolean, edgeType:string, edgeTypes:Set<EdgeTypeName>, nodeCount:number, argumentNumber?: number):Edge{
	let labelNames:string = ''
	for( const linkEdgeType of edgeTypes){
		labelNames += linkEdgeType + ' '
	}
	return (
		{
			source: source,
			target: target,
			id:     id,
			label:  labelNames,
			data:   { 
				label: labelNames, 
				edgeType: edgeType, 
				edgeTypes: edgeTypes, 
				nodeCount: nodeCount,
				isBidirectionalEdge:  isBidirectionalEdge,
				...(argumentNumber !== undefined) && {argumentNumber: argumentNumber}}
		}
	)
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
