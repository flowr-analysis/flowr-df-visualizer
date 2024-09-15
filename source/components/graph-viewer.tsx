import type { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js'
import ELK from 'elkjs/lib/elk.bundled.js'
import React, { Children, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { Edge, Node } from '@xyflow/react'
import {
	ReactFlow,
	useNodesState,
	useEdgesState,
	useReactFlow,
	MiniMap,
	Controls,
	Background,
	ControlButton,
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'

import type { VisualizationGraph } from './model/graph'
import FloatingConnectionLine, { ExitPointNode, FunctionCallNode, FunctionDefinitionNode, GroupNode, UseNode, ValueNode, VariableDefinitionNode } from './model/nodes/node-definition'
import ReadsEdge from './model/edges/reads-edge'
import { ArgumentEdge } from './model/edges/argument-edge'
import { CallsEdge } from './model/edges/calls-edge'
import { DefinedByEdge } from './model/edges/defined-by-edge'
import { DefinedByOnCallEdge } from './model/edges/defined-by-on-call-edge'
import { DefinesOnCallEdge } from './model/edges/defines-on-call-edge'
import { RelatesEdge } from './model/edges/relates-edge'
import { ReturnsEdge } from './model/edges/returns-edge'
import { SameDefDefEdge } from './model/edges/same-def-def-edge'
import { SameReadReadEdge } from './model/edges/same-read-read-edge'
import { SideEffectOnCallEdge } from './model/edges/side-effect-on-call-edge'
import { NonStandardEvaluationEdge } from './model/edges/non-standard-evaluation-edge'
import { transformGraphForLayouting, transformGraphForShowing } from './model/graph-transition'
import { MultiEdge } from './model/edges/multi-edge'
import { slideInLegend } from './graph-legend'
import { SvgDefinitionsComponent } from './svg-definitions'
import type { VisualStateModel } from './model/visual-state-model'
import { client, loadingButtonTimerId as loadingButtonTimerId, monacoEditor, setLoadingButtonTimerId } from '..'



const elk = new ELK()

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions: LayoutOptions = {
	'elk.algorithm':                             'layered', // 'stress',
	'elk.layered.spacing.nodeNodeBetweenLayers': '50',
	'elk.spacing.nodeNode':                      '80'
}

async function getLayoutedElements(nodes: Node[],
								   nodeIdMap: Map<string,Node>,
								   edges: ElkExtendedEdge[],
								   options: LayoutOptions,
								   visualStateModel: VisualStateModel): Promise<{ nodes: Node[]; edges: Edge[] }> {
	const isHorizontal = options?.['elk.direction'] === 'RIGHT'

	const graph: ElkNode = transformGraphForLayouting(nodes,nodeIdMap, edges, options, isHorizontal)
	//console.log('before Layout:')
	//console.log(graph)

	const layoutedGraph = await elk.layout(graph)

	//console.log('after Layout:')
	//console.log(layoutedGraph)
	const endGraph = transformGraphForShowing(layoutedGraph, isHorizontal, visualStateModel)

	return endGraph
}

function convertToExtendedEdges(edges: Edge[]): ElkExtendedEdge[] {
	return edges.map(edge => ({
		id:       edge.id,
		sources:  [edge.source],
		targets:  [edge.target],
		label:    edge.label as string,
		edgeType: edge.data?.edgeType ?? '',
		data:     { ...edge.data }
	}))
}


export interface LayoutFlowProps {
  readonly graph:              VisualizationGraph;
  readonly assignGraphUpdater: (updater: (g: VisualizationGraph) => void) => void;
  readonly visualStateModel:   VisualStateModel
}
export let setIsNodeIdShownReactFlow: React.Dispatch<React.SetStateAction<boolean>> = () => {}

export function startLoadingAnimation(){
	//handle loading button start of animation
	if(loadingButtonTimerId){
		clearInterval(loadingButtonTimerId)
	}
	let deg = 0
	setLoadingButtonTimerId(setInterval(() =>{
		const svgIcon = document.getElementById('reload-button-icon-container') as HTMLDivElement
		svgIcon.style.transform = `rotate(${deg}deg)`
		deg = (deg + 5) % 360
	},100))
}

export function reloadGraph(){
	
	startLoadingAnimation()
	//send file request
	const textInEditor = monacoEditor?.getValue() ?? ''
	localStorage.setItem('monaco-text', textInEditor)
	client?.sendAnalysisRequestJSON(textInEditor)
}

export let setEdgesExternal: React.Dispatch<React.SetStateAction<Edge[]>>
export let setNodesExternal: React.Dispatch<React.SetStateAction<Node[]>>

export function LayoutFlow({ graph, assignGraphUpdater, visualStateModel } : LayoutFlowProps) {
	const [currentGraph, setCurrentGraph] = useState(graph)
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
	const nodeMap = new Map<string,Node>()
	const { fitView } = useReactFlow()

	setEdgesExternal = setEdges
	setNodesExternal = setNodes

	const [isNodeIdShown, setIsNodeIdShown] = useState(false)

	setIsNodeIdShownReactFlow = setIsNodeIdShown

	useEffect(() => {
		setNodes((currentNodes) =>
			currentNodes.map((node) =>{
				node.data.isNodeIdShown = isNodeIdShown
				return ({
					...node
				})
			}),
		)
	}, [isNodeIdShown, setNodes])

	


	assignGraphUpdater(g =>  {
		setCurrentGraph(g)
		onLayout({ direction: 'DOWN', g })
	})

	const onLayout = useCallback(
		({ direction , g = undefined } : { direction: string, g?: VisualizationGraph }) => {
			console.log('graph newly generated')
			const opts = { 'elk.direction': direction, ...elkOptions }
			const ns = g ? g.nodesInfo.nodes : nodes
			const es = g ? g.edgesInfo.edges : edges
			const nm = g ? g.nodesInfo.nodeMap: nodeMap
			void getLayoutedElements(ns, nm, convertToExtendedEdges(es), opts, visualStateModel)
				.then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {

					visualStateModel.originalGraph = {nodes: layoutedNodes, edges: layoutedEdges}
					visualStateModel.alteredGraph = {nodes: [], edges: []}
					
					//copy nodes and edges for altering
					visualStateModel.originalGraph.nodes.forEach((val) => visualStateModel.alteredGraph?.nodes.push(Object.assign({}, val)))
					visualStateModel.originalGraph.edges.forEach((val) => visualStateModel.alteredGraph?.edges.push(Object.assign({}, val)))
					
					//set EdgeInformation and copy edgeConnections accordingly
					visualStateModel.originalEdgeConnectionMap = g?.edgesInfo.edgeConnectionMap
					visualStateModel.alteredEdgeConnectionMap = new Map<string, string[]>()
					//copy Connections
					visualStateModel.originalEdgeConnectionMap?.forEach((targetArray, sourceNode) => {
						const deepCopiedTargetArray: string[] = []
						targetArray.forEach((targetNode) => {
							deepCopiedTargetArray.push(targetNode)
						})
						visualStateModel.alteredEdgeConnectionMap?.set(sourceNode, deepCopiedTargetArray)
					})
					
					//Set Nodes Information
					visualStateModel.originalNodeChildrenMap = g?.nodesInfo.nodeChildrenMap
					visualStateModel.alteredNodeChildrenMap = new Map<string, string[]>()
					//copy Children Map
					visualStateModel.originalNodeChildrenMap?.forEach((childrenArray, parentNodeId) => {
						const deepCopiedChildrenArray: string[] = []
						childrenArray.forEach((childNodeId) => {
							deepCopiedChildrenArray.push(childNodeId)
						})
						visualStateModel.alteredNodeChildrenMap?.set(parentNodeId, deepCopiedChildrenArray)
					})

					//Remember which nodes have been reduced to which 
					visualStateModel.reducedToNodeMapping = new Map<string,string>()
					visualStateModel.originalGraph.nodes.forEach((node) => { visualStateModel.reducedToNodeMapping?.set(node.id, node.id)})

					setNodes(visualStateModel.alteredGraph?.nodes)
					setEdges(visualStateModel.alteredGraph?.edges)

					window.requestAnimationFrame(() => void fitView())
				})
		},
		[nodes, edges, currentGraph]
	)

	// Calculate the initial layout on mount.
	useLayoutEffect(() => {
		onLayout({ direction: 'DOWN', g: currentGraph })
	}, [])

	/* mapping custom node types */
	const nodeTypes = useMemo(() => ({
		variableDefinitionNode: VariableDefinitionNode,
		useNode:                UseNode,
		functionCallNode:       FunctionCallNode,
		exitPointNode:          ExitPointNode,
		valueNode:              ValueNode,
		functionDefinitionNode: FunctionDefinitionNode,
		groupNode:              GroupNode
	}), [])

	/* allows to map custom edge types */
	const edgeTypes = useMemo(() => ({
		readsEdge:                 ReadsEdge,
		definedByEdge:             DefinedByEdge,
		sameReadReadEdge:          SameReadReadEdge,
		sameDefDefEdge:            SameDefDefEdge,
		callsEdge:                 CallsEdge,
		returnsEdge:               ReturnsEdge,
		definesOnCallEdge:         DefinesOnCallEdge,
		definedByOnCallEdge:       DefinedByOnCallEdge,
		argumentEdge:              ArgumentEdge,
		sideEffectOnCallEdge:      SideEffectOnCallEdge,
		relatesEdge:               RelatesEdge,
		nonStandardEvaluationEdge: NonStandardEvaluationEdge,
		multiEdge:                 MultiEdge
	}),[])


	return (
		<>
			<svg style={{ position: 'absolute', top: 0, left: 0 }}>
				<defs>
					<SvgDefinitionsComponent/>
				</defs>
			</svg>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				proOptions={{ hideAttribution: true }}
				connectionLineComponent={FloatingConnectionLine}
				fitView
				onlyRenderVisibleElements
			>
				<Background />
				<MiniMap />
				<Controls>
					<ControlButton onClick={slideInLegend}>
						<ControlButtonHoverOverTextComponent hoverOverText='Legend'>
						☰	
						</ControlButtonHoverOverTextComponent>
					</ControlButton>
					<ControlButton className = 'reload-button' onClick={reloadGraph}>
						<ControlButtonHoverOverTextComponent hoverOverText='Reload Graph: Ctrl + Enter | Shift + Enter'>
							<div id = 'reload-button-icon-container'>
								<svg id ='reload-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>
							</div>
						</ControlButtonHoverOverTextComponent>
					</ControlButton>
				</Controls>
			</ReactFlow>
		</>
	)
}

interface ControlButtonHoverOverTextComponentProps{
	hoverOverText: string
}

const ControlButtonHoverOverTextComponent: React.FC<React.PropsWithChildren<ControlButtonHoverOverTextComponentProps>> = ({hoverOverText,children}) => {
	return(
		<div className='sidebar-tooltip-container'>
			{children}
			<span className='sidebar-tooltiptext'>{hoverOverText}</span>
		</div>
	)
}