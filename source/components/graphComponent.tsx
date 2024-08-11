import type { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js'
import ELK from 'elkjs/lib/elk.bundled.js'
import React, { ChangeEventHandler, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type {
	Edge,
	Node } from '@xyflow/react'
import {
	ReactFlow,
	addEdge,
	Panel,
	useNodesState,
	useEdgesState,
	useReactFlow,
	Connection,
	MiniMap,
	NodeToolbar,
	Controls,
	Background,
	Position,
	Handle,
	NodeProps,
	getStraightPath,
	BaseEdge,
	EdgeLabelRenderer,
	MarkerType,
	EdgeProps,
	applyEdgeChanges,
	ControlButton,
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'

import type { VisualizationGraph } from './model/graph'
import FloatingConnectionLine, { ExitPointNode, FunctionCallNode, FunctionDefinitionNode, GroupNode, UseNode, ValueNode, VariableDefinitionNode } from './model/nodes/nodeDefinition'
import ReadsEdge from './model/edges/readsEdge'
import { edgeTagMapper } from './model/edges/edgeBase'
import { ArgumentEdge } from './model/edges/argumentEdge'
import { CallsEdge } from './model/edges/callsEdge'
import { DefinedByEdge } from './model/edges/definedByEdge'
import { DefinedByOnCallEdge } from './model/edges/definedByOnCallEdge'
import { DefinesOnCallEdge } from './model/edges/definesOnCallEdge'
import { RelatesEdge } from './model/edges/relatesEdge'
import { ReturnsEdge } from './model/edges/returnsEdge'
import { SameDefDefEdge } from './model/edges/sameDefDefEdge'
import { SameReadReadEdge } from './model/edges/sameReadReadEdge'
import { SideEffectOnCallEdge } from './model/edges/sideEffectOnCallEdge'
import { NonStandardEvaluationEdge } from './model/edges/nonStandardEvaluationEdge'
import { flattenToNodeArray, foldIntoElkHierarchy } from './graphHierarchy'
import { ExtendedExtendedEdge, transformGraphForLayouting, transformGraphForShowing } from './model/graphTransition'
import { MultiEdge } from './model/edges/multiEdge'
import { slideInLegend } from './legendComonent'
import { SvgDefinitionsComponent } from './svgDefinitions'
import type { VisualStateModel } from './model/visualStateModel'



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

	console.log(endGraph)


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

export function LayoutFlow({ graph, assignGraphUpdater, visualStateModel } : LayoutFlowProps) {
	const [currentGraph, setCurrentGraph] = useState(graph)
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
	const nodeMap = new Map<string,Node>()
	const { fitView } = useReactFlow()

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
	}, [isNodeIdShown,setNodes])




	assignGraphUpdater(g =>  {
		setCurrentGraph(g)
		onLayout({ direction: 'DOWN', g })
	})
  
	const onLayout = useCallback(
		({ direction , g = undefined } : { direction: string, g?: VisualizationGraph }) => {
			const opts = { 'elk.direction': direction, ...elkOptions }
			const ns = g ? g.nodesInfo.nodes : nodes
			const es = g ? g.edges : edges
			const nm = g ? g.nodesInfo.nodeMap: nodeMap
			getLayoutedElements(ns, nm, convertToExtendedEdges(es), opts, visualStateModel).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
				setNodes(layoutedNodes)
				setEdges(layoutedEdges)

				window.requestAnimationFrame(() => fitView())
			})
		},
		[nodes, edges, currentGraph]
	)

	// Calculate the initial layout on mount.
	useLayoutEffect(() => {
		onLayout({ direction: 'DOWN', g: currentGraph })
	}, [])

	/* allows to map custom node types */
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
			>
				<Background />
				<MiniMap />
				<Controls>
					<ControlButton onClick={slideInLegend}>
						☰
					</ControlButton>
				</Controls>
			</ReactFlow>
		</>
	)
}

