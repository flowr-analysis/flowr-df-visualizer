import { ElkNode } from 'elkjs';
import {CoordinateExtent, Node} from 'reactflow'
import { VisualizationNodeProps } from './model/graphBuilder';

const standardHeight = 50
const standardWidth  = 150

/**
 * Transforms the Nodestructure into the structure needed for the ELK Layouting algorithm
 * @param nodes nodes given from the VisualizationGraph
 */
export function foldIntoElkHierarchy(nodes:Node[], nodesIdMap: Map<string,Node>, isHorizontal: boolean):ElkNode[]{
    const usedMap  = new Map<string, boolean>()
    nodesIdMap.forEach((node, id) => usedMap.set(id,false))

    const smthToReturn =  (nodes.map((node) => foldOnVisualizationGraphNodes(node, nodesIdMap, usedMap, isHorizontal))).filter(nonEmpty)
    
    return smthToReturn
    /*
    const returnArray = nodes.map(node =>{ 
        if(node.data.parentId !== undefined){
          return ({
            ...node,
            // Adjust the target and source handle positions based on the layout
            // direction.
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            labels: [{ text: node.data.label }],
            // Hardcode a width and height for elk to use when layouting.
            width: standardWidth,
            height: standardHeight,
            parentId: node.data.parentId,
            extent: 'parent'
          })
        }else{
          return ({
            ...node,
            // Adjust the target and source handle positions based on the layout
            // direction.
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            labels: [{ text: node.data.label }],
            // Hardcode a width and height for elk to use when layouting.
            width: standardWidth,
            height: standardHeight,
          })
        }
      })
    return returnArray
    */
}

interface ExtendedElkNode extends ElkNode{
  data:{
    label: string, 
    nodeType: string,
    parentId?: string
  }
 }

export interface HierarchyElkNode extends ElkNode {
    targetPosition: string,
    sourcePosition:string,
    parentId?: string,
    //extent?: "parent" | CoordinateExtent 
    children?: HierarchyElkNode[]
}

function nonEmpty<TValue>(value:TValue| null| undefined): value is TValue{
    return value !== null && value !== undefined
}


function foldOnVisualizationGraphNodes(currentNode: Node<VisualizationNodeProps>, 
                                       nodeIdMap: Map<string, Node<VisualizationNodeProps>>, 
                                       usedIdsMap: Map<string,boolean>,
                                       isHorizontal: boolean):HierarchyElkNode | undefined{
    if(currentNode.data.children !== undefined){
        //calculate Children of the currentNode
        const childrenOfNode : HierarchyElkNode[]= currentNode.data.children.map((nodeId) => nodeIdMap.get(nodeId)).filter((node => node !== undefined)).map((node) => 
            foldOnVisualizationGraphNodes(node!,nodeIdMap,usedIdsMap, isHorizontal)
        ).filter(nonEmpty)
        const newHeight = childrenOfNode.reduce((accumulatedHeight, node) => accumulatedHeight + (node.height ?? 0), 0) + standardHeight
        const newWidth = standardWidth + 10
        const toReturn = {
            ...currentNode,
            // Adjust the target and source handle positions based on the layout
            // direction.
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            labels: [{ text: currentNode.data.label }],
            // Hardcode a width and height for elk to use when layouting.
            width: newWidth,
            height: newHeight,
            children: childrenOfNode,
            ...(currentNode.data.parentId !== undefined) && { parentId: currentNode.data.parentId },
            ...(currentNode.data.parentId !== undefined) && { extent: 'parent' }
          }

        return toReturn
    } 

    if(usedIdsMap.get(currentNode.id)){return undefined}

    usedIdsMap.set(currentNode.id, true)
    return ({
        ...currentNode,
        // Adjust the target and source handle positions based on the layout
        // direction.
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        labels: [{ text: currentNode.data.label }],
        // Hardcode a width and height for elk to use when layouting.
        width: standardWidth,
        height: standardHeight,
        ...(currentNode.data.parentId !== undefined) && { parentId: currentNode.data.parentId },
        ...(currentNode.data.parentId !== undefined) && { extent: 'parent' }
      })

}

interface FinalNodeProps{
  label: string
  nodeType: string
  id: string
}

export function flattenToNodeArray(nodeArray:ElkNode[]):Node<FinalNodeProps>[] {
    return nodeArray.map((node) => flattenHierachyNode(node)).flat()
}

function flattenHierachyNode(currentNode:ElkNode):Node<FinalNodeProps>[]{
    let toReturnNodeArray: Node<FinalNodeProps>[] = []

    const newNode: Node<FinalNodeProps> = {
        ...currentNode,
        data: { 
          label: currentNode.labels?.[0]?.text ?? '', 
          id: currentNode.id, 
          nodeType:(currentNode as ExtendedElkNode).data.nodeType, 
          ...((currentNode as ExtendedElkNode).data.parentId !== undefined)&&{parentId:(currentNode as ExtendedElkNode).data.parentId},
          ...((currentNode as ExtendedElkNode).data.parentId !== undefined)&&{extent: 'parent'},
        },
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: currentNode.x ?? 0, y: currentNode.y ?? 0 },
    }
    toReturnNodeArray.push(newNode)
    if(currentNode.children !== undefined){
        const flattenedChildNodes = currentNode.children.map((node) => flattenHierachyNode(node)).flat()
        toReturnNodeArray = toReturnNodeArray.concat(flattenedChildNodes)
    }

    return toReturnNodeArray
}