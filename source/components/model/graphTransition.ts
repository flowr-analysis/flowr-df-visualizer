import { ElkExtendedEdge, ElkNode, LayoutOptions } from "elkjs";
import { flattenToNodeArray, foldIntoElkHierarchy} from "../graphHierachy";
import { Edge, Node } from "reactflow"
import { edgeTagMapper } from "./edges/edgeBase";

export function transformGraphForLayouting(nodes: Node[], nodeIdMap: Map<string,Node>, edges: ElkExtendedEdge[], options: LayoutOptions, isHorizontal: boolean):ElkNode{
  const toReturn: ElkNode = {
    id: 'root',
    layoutOptions: options,
    children: foldIntoElkHierarchy(nodes,nodeIdMap,isHorizontal),
    edges: edges
    };

  return toReturn
}


export interface ExtendedExtendedEdge extends ElkExtendedEdge{
  data:any
  edgeType: string
  label:string
 }

export function transformGraphForShowing(layoutedGraph: ElkNode, isHorizontal: boolean): { nodes: Node[]; edges: Edge[] }{
  
  const newNodes = flattenToNodeArray(layoutedGraph.children ?? [])

  //reset node height and width so they will be correctly calculated and set afterwards
  newNodes.forEach((node) => {
    node.height = 0
    node.width = 0
  })
  
  return {
    nodes: newNodes,
    edges: (layoutedGraph.edges as ExtendedExtendedEdge[] ?? []).map(e => { 
      return {
      id: e.id,
      source: e.sources[0],
      target: e.targets[0],
      sourceHandle: isHorizontal ? 'right' : 'bottom',
      targetHandle: isHorizontal ? 'left' : 'top',
      label: e.label,
      //animated: true,
      //style: { stroke: '#000' },
      type: edgeTagMapper(e.edgeType),
      data: { ...e.data, isHovered: false}
      };
    })
  }
}