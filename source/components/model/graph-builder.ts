import type { Edge, Node } from '@xyflow/react'
import type { VisualizationGraph } from './graph'
import { EdgeTypeName, edgeTypesToNames } from '@eagleoutice/flowr/dataflow/graph/edge'
import type { NodeId } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/node-id'
import type { ParentInformation } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/decorate'
import { visitAst } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/visitor'
import type { RNode } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/model'
import { DataflowGraph } from '@eagleoutice/flowr/dataflow/graph/graph'

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
    'args'?:        ArgsInfo[],
    'subflow'?:     SubFlowInfo
}

export interface ArgsInfo{
	nodeId: number
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

class TwoKeyMap<K1,K2, V> {
	multiMap  = new Map<K1, Map<K2, V>>()
	set(key1:K1, key2:K2, value:V):void{
		if(!this.multiMap.has(key1)){
			this.multiMap.set(key1,new Map<K2,V>())
		}
		this.multiMap.get(key1)?.set(key2, value)
	}

	get(key1:K1, key2:K2):V | undefined{
		if(!this.multiMap.has(key1)){
			return undefined
		}
		return this.multiMap.get(key1)?.get(key2)
	}
}



export function transformToVisualizationGraphForOtherGraph(ast: RNode<ParentInformation>, dataflowGraph: OtherGraph): VisualizationGraph {

	const infoMap = constructLexemeMapping(ast)

	const subflowMap = new Map<number, number>()

	const nodeIdMap = new Map<string, Node<VisualizationNodeProps>>()

	const visualizationGraph: VisualizationGraph = { nodesInfo: { nodes: [], nodeMap: nodeIdMap , nodeChildrenMap: new Map<string, string[]>()}, edgesInfo: {edges:[], edgeConnectionMap: new Map()}, }

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

	
	const edgeConnection = new Map<number, number[]>()
	const edgeConnectionString = new Map<string, string[]>()
	//Know EdgeConnections
	for( const [sourceNodeId, listOfConnectedNodes] of dataflowGraph.edgeInformation){
		const listOfConnectedNodes2 = listOfConnectedNodes
		for(const [targetNodeId] of listOfConnectedNodes2){
			if(!edgeConnection.has(sourceNodeId)){
				edgeConnection.set(sourceNodeId, [])
				edgeConnectionString.set(String(sourceNodeId), [])
			}
			edgeConnection.get(sourceNodeId)?.push(targetNodeId)
			edgeConnectionString.get(String(sourceNodeId))?.push(String(targetNodeId))
		}
	}

	//Remember EdgeConnection
	visualizationGraph.edgesInfo.edgeConnectionMap = edgeConnectionString

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
			const newEdge: Edge = {
				source: String(sourceNodeId),
				target: String(targetNodeId),
				id:     `edge-${sourceNodeId}-${targetNodeId}`,
				label:  labelNames,
				data:   { 
					label: labelNames, 
					edgeType: 'multiEdge', 
					edgeTypes: listOfEdgeTypes, 
					nodeCount: dataflowGraph.vertexInformation.length,
					isBidirectionalEdge:  isBidirectionalEdge,
					...(hasArgument) && {argumentNumber: argumentIndexMap.get(sourceNodeId, targetNodeId)}
				}
			}
			visualizationGraph.edgesInfo.edges.push(newEdge)
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
