import { Dimensions, Node, NodeDimensionChange, useInternalNode } from "@xyflow/react";
import { onNodesChangeExternal } from "../../graph-viewer";
import { VisualStateModel } from "../visual-state-model";

export function resizeParents(parentAndChildNodes: string[], visualStateModel: VisualStateModel):void{
    const nodesToChange:Map<string, Dimensions> = new Map<string, Dimensions>()
    //go backwards through array because childNodes are somewhere behind the parent node in the array
    for(let backwardsIndex:number = parentAndChildNodes.length - 1; 0 <= backwardsIndex; backwardsIndex--){
        const currentNodeId = parentAndChildNodes[backwardsIndex]
        resizeNode(currentNodeId, nodesToChange, visualStateModel)       
    }
    
    const changeArray:NodeDimensionChange[] = []
    nodesToChange.forEach((newDimension, toChangeNodeId) => {
        changeArray.push({id: toChangeNodeId, type:'dimensions', dimensions: newDimension, resizing: true, setAttributes: true})
    })
    onNodesChangeExternal(changeArray)
}

function resizeNode(currentNodeId: string, nodesToChange: Map<string, Dimensions>, visualStateModel: VisualStateModel):void{
    if(!visualStateModel.childToParentMap.has(currentNodeId)){
        return
    }
    const parentId = visualStateModel.childToParentMap.get(currentNodeId) ?? ''
    const parentObject = visualStateModel.nodeMap.get(parentId)
    const childObject = visualStateModel.nodeMap.get(currentNodeId)

    if(parentObject !== undefined && childObject !== undefined){
        //get children dimensions
        const isChildAlreadyResized = nodesToChange.has(currentNodeId)
        const childWidth = isChildAlreadyResized ? (nodesToChange.get(currentNodeId)?.width ?? 0) : childObject.measured?.width ?? 0
        const childHeight = isChildAlreadyResized ? (nodesToChange.get(currentNodeId)?.height ?? 0) : childObject.measured?.height ?? 0
        const childPosition = childObject.position

        //get parent dimensions
        const isParentAlreadyResized = nodesToChange.has(parentId)
        const parentWidth = isParentAlreadyResized ? (nodesToChange.get(parentId)?.width ?? 0) : parentObject.measured?.width ?? 0
        const parentHeight = isParentAlreadyResized ? (nodesToChange.get(parentId)?.height ?? 0) : parentObject.measured?.height ?? 0
        
        //see how far the child extends
        const childMaxExtensionWidth = childPosition.x + childWidth
        const childMaxExtensionHeight = childPosition.y + childHeight

        //check if child extends parent
        const isWidthTooSmall = parentWidth < childMaxExtensionWidth
        const isHeightTooSmall = parentHeight < childMaxExtensionHeight

        if(isWidthTooSmall || isHeightTooSmall){
            //set the new Height and width
            const newParentWidth = Math.max(parentWidth, childMaxExtensionWidth)
            const newParentHeight = Math.max(parentHeight, childMaxExtensionHeight) 
            const newDimension: Dimensions = {
                width: newParentWidth,
                height: newParentHeight
            }
            nodesToChange.set(parentId, newDimension)
            resizeNode(parentId, nodesToChange, visualStateModel)
        }
    }
}