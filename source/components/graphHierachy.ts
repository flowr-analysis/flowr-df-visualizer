import { ElkNode } from 'elkjs';
import {CoordinateExtent, Node, XYPosition} from '@xyflow/react'
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

    const smthToReturn =  (nodes.map((node) => foldOnVisualizationGraphNodes(node as Node<VisualizationNodeProps>, nodesIdMap as Map<string, Node<VisualizationNodeProps>>, usedMap, isHorizontal))).filter(nonEmpty)
    
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
    parentId?: string,
    children?: string[]
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

interface FinalNodeProps extends Record<string, unknown> {
  label: string
  nodeType: string
  id: string
  estimatedMaxX: number
  estimatedMaxY: number
  estimatedMinX: number
  estimatedMinY: number
}

interface FlattenReturnProperties{
  node: Node<FinalNodeProps>
  minX: number
  minY: number
  maxX: number
  maxY: number
}


export function flattenToNodeArray(nodeArray:ElkNode[]):Node<FinalNodeProps>[] {
    return nodeArray.map((node) => flattenHierachyNode(node,{x: 0, y: 0})).flat().map((returnProperty) => returnProperty.node)
}

function flattenHierachyNode(currentNode: ElkNode, positionParentNode: XYPosition):FlattenReturnProperties[]{
    let toReturnNodeArray: FlattenReturnProperties[] = []

    const absolutePositionX = (currentNode.x ?? 0) + (positionParentNode.x ?? 0) 
    const absolutePositionY = (currentNode.y ?? 0) + (positionParentNode.y ?? 0)
    const newNode: Node<FinalNodeProps> = {
        ...currentNode,
        data: { 
          label: currentNode.labels?.[0]?.text ?? '', 
          id: currentNode.id, 
          nodeType:(currentNode as ExtendedElkNode).data.nodeType,
          estimatedMinX: absolutePositionX,
          estimatedMinY: absolutePositionY,
          estimatedMaxX: absolutePositionX + (currentNode.width ?? 0),
          estimatedMaxY: absolutePositionY + (currentNode.height ?? 0),
          ...((currentNode as ExtendedElkNode).data.parentId !== undefined)&&{parentId:(currentNode as ExtendedElkNode).data.parentId},
          ...((currentNode as ExtendedElkNode).data.parentId !== undefined)&&{extent: 'parent'},
          ...((currentNode as ExtendedElkNode).data.children !== undefined)&&{children:(currentNode as ExtendedElkNode).data.children},
        },
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        //position is adapted since the position the layout generates is relative to the parent
        position: { x: absolutePositionX, y: absolutePositionY },
    }

    const newFlattenedProperty: FlattenReturnProperties = {
      node: newNode,
      minX: newNode.data.estimatedMinX,
      minY: newNode.data.estimatedMinY,
      maxX: newNode.data.estimatedMaxX,
      maxY: newNode.data.estimatedMaxY
    }

    toReturnNodeArray.push(newFlattenedProperty)
    if(currentNode.children !== undefined){
        const flattenedChildNodes = currentNode.children.map((node) => flattenHierachyNode(node, newNode.position)).flat()
        
        //calculate dimensions for function definiton node
        newNode.data.estimatedMaxX = flattenedChildNodes.map((flattenedProperty) => flattenedProperty.maxX).reduce((previousMax, currentMax) => {
          return previousMax < currentMax ? currentMax : previousMax
        }, 0)
        newNode.data.estimatedMaxY = flattenedChildNodes.map((flattenedProperty) => flattenedProperty.maxY).reduce((previousMax, currentMax) => {
          return previousMax < currentMax ? currentMax : previousMax
        }, 0)

        toReturnNodeArray = toReturnNodeArray.concat(flattenedChildNodes)
    }

    return toReturnNodeArray
}