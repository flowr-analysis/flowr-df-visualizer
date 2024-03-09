import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { useCallback, useLayoutEffect } from 'react';
import ReactFlow, {
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Edge,
  Node,
  Connection,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { VisualizationGraph } from './model/graph';



const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions: LayoutOptions = {
   'elk.algorithm': 'layered',
   'elk.layered.spacing.nodeNodeBetweenLayers': '100',
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
         data: { label: node.id },
         // React Flow expects a position property on the node instead of `x`
         // and `y` fields.
         position: { x: node.x ?? 0, y: node.y ?? 0 },
       })) ?? [],
       edges: (layoutedGraph.edges ?? []).map(e => {
         return {
           id: e.id,
           source: e.sources[0],
           target: e.targets[0],
           sourceHandle: isHorizontal ? 'right' : 'bottom',
           targetHandle: isHorizontal ? 'left' : 'top',
           label: e.id,
           animated: true,
           style: { stroke: '#000' },
           arrowHeadType: 'arrowclosed',
           type: 'smoothstep',
           data: { label: e.id }
         };
       })
     }
 }

 function convertToExtendedEdges(edges: Edge[]): ElkExtendedEdge[] {
   return edges.map(edge => ({
     id: edge.id,
     sources: [edge.source],
     targets: [edge.target],
   }));
 }

 export function LayoutFlow({ graph } : { readonly graph: VisualizationGraph}) {
   const [nodes, setNodes, onNodesChange] = useNodesState([]);
   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
   const { fitView } = useReactFlow();

   const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), []);
   const onLayout = useCallback(
     ({ direction , useInitialNodes = false } : { direction: string, useInitialNodes?: boolean }) => {
       const opts = { 'elk.direction': direction, ...elkOptions };
       const ns = useInitialNodes ? graph.nodes : nodes;
       const es = useInitialNodes ? graph.edges : edges;

       getLayoutedElements(ns, convertToExtendedEdges(es), opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
         setNodes(layoutedNodes);
         setEdges(layoutedEdges);

         window.requestAnimationFrame(() => fitView());
       });
     },
     [nodes, edges]
   );

   // Calculate the initial layout on mount.
   useLayoutEffect(() => {
     onLayout({ direction: 'DOWN', useInitialNodes: true });
   }, []);

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       onConnect={onConnect}
       onNodesChange={onNodesChange}
       onEdgesChange={onEdgesChange}
       fitView
     >
       <Panel position="top-right">
         <button onClick={() => onLayout({ direction: 'DOWN' })}>vertical layout</button>

         <button onClick={() => onLayout({ direction: 'RIGHT' })}>horizontal layout</button>
       </Panel>
     </ReactFlow>
   );
 }
