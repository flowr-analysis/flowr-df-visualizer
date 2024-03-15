import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { ChangeEventHandler, useCallback, useLayoutEffect, useMemo } from 'react';
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
} from 'reactflow';

import 'reactflow/dist/style.css';
import { VisualizationGraph } from './model/graph';


function VariableDefinitionNode({ data } : { readonly data: NodeProps['data'] }) {
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ background: 'none', border: 'none'  }} />
      <div style={{ border: 'solid 2px', padding: '5px', margin: '0px' }}>
        <label htmlFor="text">{data.label}</label>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false}  style={{ background: 'none', border: 'none' }} />
    </>
  );
}

function UseNode({ data } : { readonly data: NodeProps['data'] }){
  return(
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ background: 'none', border: 'none'  }} />
      <div style={{ border: 'solid 2px', padding: '5px', margin: '0px', borderRadius: '20px'}}>
        <label htmlFor="text">{data.label}</label>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false}  style={{ background: 'none', border: 'none' }} />
    </>
  )
}

function FunctionCallNode({ data } : { readonly data: NodeProps['data'] }){
  return(
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ background: 'none', border: 'none'  }} />
      <div style={{ border: 'solid 2px', padding: '0px', margin: '0px'}}>
        <div style= {{width: '3px', float: 'left', border: 'solid 2px', padding: '0px', margin: '0px', height: '18px'}}> </div>
        <label htmlFor="text">{data.label}</label>
        <div style= {{width: '3px', float:'right', border: 'solid 2px', padding: '0px', margin: '0px', height: '18px'}}> </div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false}  style={{ background: 'none', border: 'none' }} />
    </>
  )
}

function ExitPointNode({ data } : { readonly data: NodeProps['data'] }) {
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ background: 'none', border: 'none'  }} />
      <div style={{ border: 'solid 2px', padding: '5px', margin: '0px', borderStyle: 'dotted' }}>
        <label htmlFor="text">{data.label}</label>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false}  style={{ background: 'none', border: 'none' }} />
    </>
  );
}

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
         data: { label: node.labels?.[0]?.text },
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
   /* allows to map custom types */
   const nodeTypes = useMemo(() => ({ 
    variableDefinitionNode: VariableDefinitionNode, 
    useNode: UseNode, 
    functionCallNode: FunctionCallNode,
    exitPointNode: ExitPointNode
   }), []);

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
       onNodesChange={onNodesChange}
       onEdgesChange={onEdgesChange}
       proOptions={{hideAttribution: true}}
       fitView
     >
      <Background />
      <MiniMap />
      <Controls />
     </ReactFlow>
   );
 }
