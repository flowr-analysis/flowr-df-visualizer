import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import React, { ChangeEventHandler, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Edge,
  Node,
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
} from 'reactflow';

import 'reactflow/dist/style.css';
import { VisualizationGraph } from './model/graph';
import { ExitPointNode, FunctionCallNode, UseNode, ValueNode, VariableDefinitionNode } from './model/nodes/nodeDefinition';
import ReadsEdge from './model/edges/readsEdge';
import { edgeTagMapper } from './model/edges/edgeBase';
import { ArgumentEdge } from './model/edges/argumentEdge';
import { CallsEdge } from './model/edges/callsEdge';
import { DefinedByEdge } from './model/edges/definedByEdge';
import { DefinedByOnCallEdge } from './model/edges/definedByOnCallEdge';
import { DefinesOnCallEdge } from './model/edges/definesOnCallEdge';
import { RelatesEdge } from './model/edges/relatesEdge';
import { ReturnsEdge } from './model/edges/returnsEdge';
import { SameDefDefEdge } from './model/edges/sameDefDefEdge';
import { SameReadReadEdge } from './model/edges/sameReadReadEdge';
import { SideEffectOnCallEdge } from './model/edges/sideEffectOnCallEdge';
import { NonStandardEvaluationEdge } from './model/edges/nonStandardEvaluationEdge';



const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions: LayoutOptions = {
   'elk.algorithm': 'layered', // 'stress',
   'elk.layered.spacing.nodeNodeBetweenLayers': '50',
   'elk.spacing.nodeNode': '80'
 };


 async function getLayoutedElements(nodes: Node[], edges: ElkExtendedEdge[], options: LayoutOptions): Promise<{ nodes: Node[]; edges: Edge[] }> {
   const isHorizontal = options?.['elk.direction'] === 'RIGHT';
   const graph: ElkNode = {
     id: 'root',
     layoutOptions: options,
     children: nodes.map(node => ({
       ...node,
       // Adjust the target and source handle positions based on the layout
       // direction.
       targetPosition: isHorizontal ? 'left' : 'top',
       sourcePosition: isHorizontal ? 'right' : 'bottom',
       labels: [{ text: node.data.label }],
       // Hardcode a width and height for elk to use when layouting.
       width: 150,
       height: 50,
     })),
     edges: edges
   };

   const layoutedGraph = await elk.layout(graph)
   return {
       nodes: layoutedGraph.children?.map(node => ({
         ...node,
         data: { label: node.labels?.[0]?.text, id: node.id, nodeType:(node as ExtendedElkNode).data.nodeType},
         // React Flow expects a position property on the node instead of `x`
         // and `y` fields.
         position: { x: node.x ?? 0, y: node.y ?? 0 },
       })) ?? [],
       edges: (layoutedGraph.edges as ExtendedExtendedEdge[] ?? []).map(e => {
        console.log(e.label) 
        return {
           id: e.id,
           source: e.sources[0],
           target: e.targets[0],
           sourceHandle: isHorizontal ? 'right' : 'bottom',
           targetHandle: isHorizontal ? 'left' : 'top',
           label: e.label,
           //animated: true,
           //style: { stroke: '#000' },
           //arrowHeadType: 'arrowclosed',
           type: edgeTagMapper(e.edgeType),
           data: { label: e.label }
         };
       })
     }
 }

 interface ExtendedExtendedEdge extends ElkExtendedEdge{
  edgeType: string
  label:string
 }

 interface ExtendedElkNode extends ElkNode{
  data:{
    label:string, 
    nodeType:string
  }
 }

 function convertToExtendedEdges(edges: Edge[]): ElkExtendedEdge[] {
   return edges.map(edge => ({
     id: edge.id,
     sources: [edge.source],
     targets: [edge.target],
     label: edge.label as string,
     edgeType: edge.data.edgeType ?? ''
   }));
 }


export interface LayoutFlowProps {
  readonly graph: VisualizationGraph;
  readonly assignGraphUpdater: (updater: (g: VisualizationGraph) => void) => void;
}

 export function LayoutFlow({ graph, assignGraphUpdater } : LayoutFlowProps) {
   const [currentGraph, setCurrentGraph] = useState(graph);
   const [nodes, setNodes, onNodesChange] = useNodesState([]);
   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
   const { fitView } = useReactFlow();
   
   assignGraphUpdater(g =>  {
    setCurrentGraph(g)
    onLayout({ direction: 'DOWN', g })
  })

   const onLayout = useCallback(
     ({ direction , g = undefined } : { direction: string, g?: VisualizationGraph }) => {
       const opts = { 'elk.direction': direction, ...elkOptions };
       const ns = g ? g.nodes : nodes;
       const es = g ? g.edges : edges;
      
       getLayoutedElements(ns, convertToExtendedEdges(es), opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
         setNodes(layoutedNodes);
         setEdges(layoutedEdges);

         window.requestAnimationFrame(() => fitView());
       });
     },
     [nodes, edges, currentGraph]
   );

   // Calculate the initial layout on mount.
   useLayoutEffect(() => {
     onLayout({ direction: 'DOWN', g: currentGraph });
   }, []);

   /* allows to map custom node types */
   const nodeTypes = useMemo(() => ({
    variableDefinitionNode: VariableDefinitionNode,
    useNode: UseNode,
    functionCallNode: FunctionCallNode,
    exitPointNode: ExitPointNode,
    valueNode: ValueNode
   }), []);

   /* allows to map custom edge types */
   const edgeTypes = useMemo(() => ({
    readsEdge: ReadsEdge,
    definedByEdge: DefinedByEdge,
    sameReadReadEdge: SameReadReadEdge,
    sameDefDefEdge: SameDefDefEdge,
    callsEdge: CallsEdge,
    returnsEdge: ReturnsEdge,
    definesOnCallEdge: DefinesOnCallEdge,
    definedByOnCallEdge: DefinedByOnCallEdge,
    argumentEdge: ArgumentEdge,
    sideEffectOnCallEdge: SideEffectOnCallEdge,
    relatesEdge: RelatesEdge,
    nonStandardEvaluationEdge: NonStandardEvaluationEdge
  }),[])

   return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
        <marker
          id="triangle"
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="10"
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
    </marker>
        </defs>
      </svg>
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
       edgeTypes={edgeTypes}
       onNodesChange={onNodesChange}
       onEdgesChange={onEdgesChange}
       proOptions={{hideAttribution: true}}
       fitView
     >
      <Background />
      <MiniMap />
      <Controls />
     </ReactFlow>
     </>
   );
 }

