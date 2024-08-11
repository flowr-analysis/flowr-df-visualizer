import type { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js'
import ELK from 'elkjs/lib/elk.bundled.js'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
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
			void getLayoutedElements(ns, nm, convertToExtendedEdges(es), opts, visualStateModel)
				.then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
					setNodes(layoutedNodes)
					setEdges(layoutedEdges)

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

