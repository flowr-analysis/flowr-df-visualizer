import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import React, { ChangeEventHandler, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
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
  applyEdgeChanges,
  ControlButton,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { VisualizationGraph } from './model/graph';
import FloatingConnectionLine, { ExitPointNode, FunctionCallNode, FunctionDefinitionNode, GroupNode, UseNode, ValueNode, VariableDefinitionNode } from './model/nodes/nodeDefinition';
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
import { flattenToNodeArray, foldIntoElkHierarchy } from './graphHierarchy';
import { ExtendedExtendedEdge, transformGraphForLayouting, transformGraphForShowing } from './model/graphTransition';
import { MultiEdge } from './model/edges/multiEdge';
import { slideInLegend } from './legendComonent';



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


 async function getLayoutedElements(nodes: Node[], nodeIdMap: Map<string,Node>, edges: ElkExtendedEdge[], options: LayoutOptions): Promise<{ nodes: Node[]; edges: Edge[] }> {
   const isHorizontal = options?.['elk.direction'] === 'RIGHT';

   const graph: ElkNode = transformGraphForLayouting(nodes,nodeIdMap, edges, options, isHorizontal)
  //console.log('before Layout:')
  //console.log(graph)

   const layoutedGraph = await elk.layout(graph)

   //console.log('after Layout:')
   //console.log(layoutedGraph)
   const endGraph = transformGraphForShowing(layoutedGraph, isHorizontal)

   //console.log(endGraph)


   return endGraph
 }

 function convertToExtendedEdges(edges: Edge[]): ElkExtendedEdge[] {
   return edges.map(edge => ({
     id: edge.id,
     sources: [edge.source],
     targets: [edge.target],
     label: edge.label as string,
     edgeType: edge.data?.edgeType ?? '',
     data:{...edge.data}
   }));
 }


export interface LayoutFlowProps {
  readonly graph: VisualizationGraph;
  readonly assignGraphUpdater: (updater: (g: VisualizationGraph) => void) => void;
}

 export function LayoutFlow({ graph, assignGraphUpdater } : LayoutFlowProps) {
   const [currentGraph, setCurrentGraph] = useState(graph);
   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
   const nodeMap = new Map<string,Node>() // correct Way to do it?????
   const { fitView } = useReactFlow();
   
   assignGraphUpdater(g =>  {
    setCurrentGraph(g)
    onLayout({ direction: 'DOWN', g })
  })
  
   const onLayout = useCallback(
     ({ direction , g = undefined } : { direction: string, g?: VisualizationGraph }) => {
       const opts = { 'elk.direction': direction, ...elkOptions };
       const ns = g ? g.nodesInfo.nodes : nodes;
       const es = g ? g.edges : edges;
       const nm = g ? g.nodesInfo.nodeMap: nodeMap;
       getLayoutedElements(ns, nm, convertToExtendedEdges(es), opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
         setNodes(layoutedNodes);
         setEdges(layoutedEdges);
         //console.log(layoutedNodes)

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
    valueNode: ValueNode,
    functionDefinitionNode: FunctionDefinitionNode,
    groupNode:GroupNode
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
    nonStandardEvaluationEdge: NonStandardEvaluationEdge,
    multiEdge: MultiEdge
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

          <symbol id="dotSymbol" width="10" height="10" overflow={'visible'}>
            <g>
              <circle r = '3' cx={0} cy = {0} overflow={'visible'} />
            </g>
          </symbol>

          <symbol id="crossSymbol" width="10" height="10" overflow={'visible'}>  
            <g>
              <line x1='0' y1='3' x2='0' y2='-3' style={{stroke:'black', strokeWidth: '1'}}></line>
            <line x1='3' y1='0' x2='-3' y2='0' style={{stroke:'black', strokeWidth: '1'}}></line>
          </g>
            </symbol>
          
          <symbol id = 'hexagonHollowSymbol' width="2.5" height="2.5" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-12,-12)'>
              <path d="m16.476 3c.369 0 .709.197.887.514.9 1.595 3.633 6.445 4.509 8.001.075.131.118.276.126.423.012.187-.029.377-.126.547-.876 1.556-3.609 6.406-4.509 8-.178.318-.518.515-.887.515h-8.951c-.369 0-.709-.197-.887-.515-.899-1.594-3.634-6.444-4.51-8-.085-.151-.128-.318-.128-.485s.043-.334.128-.485c.876-1.556 3.611-6.406 4.51-8.001.178-.317.518-.514.887-.514zm-8.672 1.5-4.228 7.5 4.228 7.5h8.393l4.227-7.5-4.227-7.5z"/>
            </g>
          </symbol>
          
          <symbol id = 'rectangleHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" stroke-linejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m3 17v3c0 .621.52 1 1 1h3v-1.5h-2.5v-2.5zm8.5 4h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5zm5-4h-1.5v2.5h-2.5v1.5h3c.478 0 1-.379 1-1zm-1.5-1v-3.363h1.5v3.363zm-15-3.363v3.363h-1.5v-3.363zm15-1v-3.637h1.5v3.637zm-15-3.637v3.637h-1.5v-3.637zm12.5-5v1.5h2.5v2.5h1.5v-3c0-.478-.379-1-1-1zm-10 0h-3c-.62 0-1 .519-1 1v3h1.5v-2.5h2.5zm4.5 1.5h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5z" fillRule="nonzero"/></svg>
            </g>
          </symbol>
          
          <symbol id = 'triangleHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m2.095 19.882 9.248-16.5c.133-.237.384-.384.657-.384.272 0 .524.147.656.384l9.248 16.5c.064.115.096.241.096.367 0 .385-.309.749-.752.749h-18.496c-.44 0-.752-.36-.752-.749 0-.126.031-.252.095-.367zm1.935-.384h15.939l-7.97-14.22z" fillRule="nonzero"/></svg>
            </g>
          </symbol>
          
          <symbol id='rhombusHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clip-rule="evenodd" fillRule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.262 2.306c.196-.196.461-.306.738-.306s.542.11.738.306c1.917 1.917 7.039 7.039 8.956 8.956.196.196.306.461.306.738s-.11.542-.306.738c-1.917 1.917-7.039 7.039-8.956 8.956-.196.196-.461.306-.738.306s-.542-.11-.738-.306c-1.917-1.917-7.039-7.039-8.956-8.956-.196-.196-.306-.461-.306-.738s.11-.542.306-.738c1.917-1.917 7.039-7.039 8.956-8.956zm-7.573 9.694 8.311 8.311 8.311-8.311-8.311-8.311z" fill-rule="nonzero"/></svg>
            </g>
          </symbol>

          <symbol id='starFilledSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
            <svg clip-rule="evenodd" fillRule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fill-rule="nonzero"/></svg>
            </g>
          </symbol>

          <symbol id='circleHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
            <svg clip-rule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 2c5.517 0 9.997 4.48 9.997 9.998 0 5.517-4.48 9.997-9.997 9.997-5.518 0-9.998-4.48-9.998-9.997 0-5.518 4.48-9.998 9.998-9.998zm0 1.5c-4.69 0-8.498 3.808-8.498 8.498s3.808 8.497 8.498 8.497 8.497-3.807 8.497-8.497-3.807-8.498-8.497-8.498z" fill-rule="nonzero"/></svg>
            </g>
          </symbol>

          <symbol id='cubeFilledSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m3.514 6.61c-.317.179-.514.519-.514.887v8.95c0 .37.197.708.514.887 1.597.901 6.456 3.639 8.005 4.512.152.085.319.128.487.128.164 0 .328-.041.477-.123 1.549-.855 6.39-3.523 7.994-4.408.323-.177.523-.519.523-.891v-9.055c0-.368-.197-.708-.515-.887-1.595-.899-6.444-3.632-7.999-4.508-.151-.085-.319-.128-.486-.128-.168 0-.335.043-.486.128-1.555.876-6.405 3.609-8 4.508m15.986 2.115v7.525l-6.75 3.722v-7.578zm-15 7.425v-7.458l6.75 3.75v7.511zm.736-8.769 6.764-3.813 6.801 3.834-6.801 3.716z" fill-rule="nonzero"/></svg>
            </g>
          </symbol>
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
   );
 }

