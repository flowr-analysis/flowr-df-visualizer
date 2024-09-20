import { Children } from "react";
import { visualStateModel } from "../..";
import { setEdgesExternal, setNodesExternal } from "../graph-viewer";
import { addEdge, Edge } from "@xyflow/react";
import { EdgeTypeName } from "@eagleoutice/flowr/dataflow/graph/edge";
import { generateEdge } from "./graph-builder";
import { EdgeInfo, VisualStateModel } from "./visual-state-model";
import { TwoKeyMap } from "../utility/two-key-map";
import { transformBuildedEdgesToShowEdges } from "./graph-transition";

let combineEdgeIdIndex = 1

export function reduceOnFunctionDefinitionNode(reduceNodeId: string){
    const childrenArrayReductionNode = visualStateModel.alteredNodeChildrenMap?.get(reduceNodeId)
    const deletedCHildrenArray: string[] = [] 
    childrenArrayReductionNode?.forEach((childId) => {
        deleteChildrenAccordingly(reduceNodeId, childId, deletedCHildrenArray)
    })

    //delete Nodes from Array
    setNodesExternal((nodes) => nodes.filter((node) => {
        const doesNodeStayInArray = deletedCHildrenArray.find((deletedChildId) => deletedChildId === node.id) === undefined
        if(doesNodeStayInArray){
            visualStateModel.deletedNodes.set(reduceNodeId, node)
        }
        return doesNodeStayInArray
    }))
    
    updateEdges(reduceNodeId,deletedCHildrenArray,visualStateModel.alteredGraph?.edges ?? [])

}

function deleteChildrenAccordingly(reduceNodeId: string, currentNodeId: string, deletedChildren: string []): string[]{
    const childrenArray = visualStateModel.alteredNodeChildrenMap?.get(currentNodeId)
    //If this node has children also reduce this one
    childrenArray?.forEach((childId) => {
        deleteChildrenAccordingly(reduceNodeId, childId, deletedChildren)
    })

    //remember which node was reduced to which
    visualStateModel.reducedToNodeMapping?.set(currentNodeId, reduceNodeId)
    if(!visualStateModel.nodeContainsReducedNodes?.has(reduceNodeId)){
        visualStateModel.nodeContainsReducedNodes?.set(reduceNodeId, [])
    }
    visualStateModel.nodeContainsReducedNodes?.get(reduceNodeId)?.push(currentNodeId)

    //node has no children anymore
    visualStateModel.alteredNodeChildrenMap.delete(currentNodeId)

    deletedChildren.push(currentNodeId)

    return deletedChildren
}


function updateEdges(reduceNodeId: string, deletedNodesIdArray: string[], edges: Edge[]):void{
    const deletedEdges: EdgeSourceTarget[] = []
    const deleteEdgesMap: TwoKeyMap<string, string, boolean> = new TwoKeyMap<string, string, boolean>()
    const toAddEdges: EdgeSourceTarget[] = []
    const addEdgesMap: TwoKeyMap<string, string, boolean> = new TwoKeyMap<string, string, boolean>()

    edges.forEach((currentEdge) => {
        if(deletedNodesIdArray.find((nodeId) => currentEdge.target === nodeId) !== undefined){
            //is already a combined edge?
            const hasAlreadyBeenReduced = visualStateModel.combinedEdges.has(currentEdge.source, currentEdge.target)
            //target and source inside the reduction
            const isInsideReduction = visualStateModel.deletedNodes.has(currentEdge.source) || currentEdge.source === reduceNodeId
            
            if(hasAlreadyBeenReduced){
                //delete edge from info
                visualStateModel.combinedEdges.delete(currentEdge.source, currentEdge.target)
            }
            
            //get origin edges
            const originEdgesArray = hasAlreadyBeenReduced ? 
                                     (visualStateModel.combinedEdges.get(currentEdge.source, currentEdge.target) ?? []) :
                                     [{source: currentEdge.source, target: currentEdge.target, edgeTypes:currentEdge.data?.edgeTypes as Set<EdgeTypeName>?? new Set<EdgeTypeName>()}]
            
            if(isInsideReduction){
                //set all edges to not defined edges
                originEdgesArray.forEach((edgeInfo) => {
                    visualStateModel.unCombinedDeletedEdges.set(edgeInfo.source, edgeInfo.target, edgeInfo)
                })
            } else {
                const hasEdgeWithSameTarget = visualStateModel.alteredEdgeConnectionMap.has(currentEdge.source, reduceNodeId)
                if(hasEdgeWithSameTarget){
                    const isTargetCombinedEdge = visualStateModel.combinedEdges.has(currentEdge.source, reduceNodeId) 
                    if(isTargetCombinedEdge){
                        //combine origin edges
                        const allCombinedEdges = originEdgesArray.concat(visualStateModel.combinedEdges.get(currentEdge.source, reduceNodeId) ?? [])
                        visualStateModel.combinedEdges.set(currentEdge.source, reduceNodeId, allCombinedEdges)
                        deletedEdges.push({source:currentEdge.source, target:reduceNodeId})
                    }else {
                        originEdgesArray.push({source:currentEdge.source, target:reduceNodeId, edgeTypes:visualStateModel.alteredEdgeConnectionMap.get(currentEdge.source, reduceNodeId) ?? new Set<EdgeTypeName>()})
                        visualStateModel.combinedEdges.set(currentEdge.source, reduceNodeId, originEdgesArray)
                    }
                } else {
                    visualStateModel.combinedEdges.set(currentEdge.source, reduceNodeId, originEdgesArray)
                }

                //add edge if not already it didnt happen already
                if(!addEdgesMap.has(currentEdge.source, reduceNodeId)){
                    toAddEdges.push({source:currentEdge.source, target: reduceNodeId})
                    addEdgesMap.set(currentEdge.source, reduceNodeId, true)
                }
            }
            deletedEdges.push({source:currentEdge.source, target:currentEdge.target})
            
            return
        }

        //correct source of edge to reduce node
        if(deletedNodesIdArray.find((nodeId) => currentEdge.source === nodeId) !== undefined){
             //is already a combined edge?
            const hasAlreadyBeenReduced = visualStateModel.combinedEdges.has(currentEdge.source, currentEdge.target)
            //target and source inside the reduction
            const isInsideReduction = visualStateModel.deletedNodes.has(currentEdge.target) || currentEdge.target === reduceNodeId
            
            if(hasAlreadyBeenReduced){
                //delete edge from info
                visualStateModel.combinedEdges.delete(currentEdge.source, currentEdge.target)
            }
            
            //get origin edges
            const originEdgesArray = hasAlreadyBeenReduced ? 
                                     (visualStateModel.combinedEdges.get(currentEdge.source, currentEdge.target) ?? []) :
                                     [{source: currentEdge.source, target: currentEdge.target, edgeTypes:currentEdge.data?.edgeTypes as Set<EdgeTypeName> ?? new Set<EdgeTypeName>()}]
                
            if(isInsideReduction){
                //set all edges to not defined edges
                originEdgesArray.forEach((edgeInfo) => {
                    visualStateModel.unCombinedDeletedEdges.set(edgeInfo.source, edgeInfo.target, edgeInfo)
                })
            } else {
                const hasEdgeWithSameTarget = visualStateModel.alteredEdgeConnectionMap.has(reduceNodeId, currentEdge.target)
                if(hasEdgeWithSameTarget){
                    const isTargetCombinedEdge = visualStateModel.combinedEdges.has(reduceNodeId, currentEdge.target) 
                    if(isTargetCombinedEdge){
                        //combine origin edges
                        const allCombinedEdges = originEdgesArray.concat(visualStateModel.combinedEdges.get(reduceNodeId, currentEdge.target) ?? [])
                        visualStateModel.combinedEdges.set(reduceNodeId, currentEdge.target, allCombinedEdges)
                        deletedEdges.push({source: reduceNodeId, target: currentEdge.target})
                    }else {
                        originEdgesArray.push({source:reduceNodeId, target: currentEdge.target, edgeTypes: visualStateModel.alteredEdgeConnectionMap.get(currentEdge.source, reduceNodeId) ?? new Set<EdgeTypeName>()})
                        visualStateModel.combinedEdges.set(reduceNodeId, currentEdge.target, originEdgesArray)
                    }
                } else {
                    visualStateModel.combinedEdges.set(reduceNodeId, currentEdge.target, originEdgesArray)
                }

                //add edge if not already it didnt happen already
                if(!addEdgesMap.has(reduceNodeId, currentEdge.target)){
                    toAddEdges.push({source: reduceNodeId, target: currentEdge.target})
                    addEdgesMap.set(reduceNodeId, currentEdge.target, true)
                }
                
            }
            deletedEdges.push({source:currentEdge.source, target:currentEdge.target})
            
            return
        }
    })


    console.log(deletedEdges)
    console.log(toAddEdges)
    
    //delete edges
    //delete from view
    setEdgesExternal(
        (edges) => edges.filter(
            (edge) => deletedEdges.find(
                (deleteEdgeInfo) => (deleteEdgeInfo.source === edge.source && deleteEdgeInfo.target === edge.target)) === undefined
        )
    )

    
    //delete from model 
    deletedEdges.forEach((deleteEdge) => { 
        visualStateModel.alteredEdgeConnectionMap.delete(deleteEdge.source, deleteEdge.target)
        visualStateModel.alteredReversedEdgeConnectionMap.delete(deleteEdge.target, deleteEdge.source)
    })

    //add edges
    const newEdgesArray:Edge[] = []
    toAddEdges.forEach((currentAddEdge) => {
        const infoArray = visualStateModel.combinedEdges.get(currentAddEdge.source, currentAddEdge.target) ?? []
        const isBidirectional = visualStateModel.combinedEdges.has(currentAddEdge.target, currentAddEdge.source) || visualStateModel.alteredEdgeConnectionMap.has(currentAddEdge.target, currentAddEdge.source)
        
        //combine Sets
        const accumulatedEdgeTypeNameSet = new Set<EdgeTypeName>(infoArray.at(0)?.edgeTypes)
        for(let edgeInfoIndex = 1; edgeInfoIndex < infoArray.length; edgeInfoIndex++){
            const currentEdgeSet = infoArray.at(edgeInfoIndex)?.edgeTypes ?? new Set<EdgeTypeName>()
            currentEdgeSet.forEach((edgeType) => {
                if(!accumulatedEdgeTypeNameSet.has(edgeType)){
                    accumulatedEdgeTypeNameSet.add(edgeType)
                }
            })
        }

        //add to model
        visualStateModel.alteredEdgeConnectionMap.set(currentAddEdge.source, currentAddEdge.target, accumulatedEdgeTypeNameSet)
        visualStateModel.alteredReversedEdgeConnectionMap.set(currentAddEdge.target, currentAddEdge.source, true)

        
        const newEdge = generateEdge(
            `edge-${currentAddEdge.source}-${currentAddEdge.target}-${combineEdgeIdIndex}`,
            currentAddEdge.source, 
            currentAddEdge.target, 
            isBidirectional, 
            'multiEdge', 
            accumulatedEdgeTypeNameSet, 
            visualStateModel.nodeCount,
            undefined)
        combineEdgeIdIndex++
        newEdgesArray.push(newEdge)
    })

    const transformedEdges = transformBuildedEdgesToShowEdges(newEdgesArray, visualStateModel)
    
    setEdgesExternal((edges) => edges.concat(transformedEdges))
}



interface EdgeSourceTarget {
    source: string
    target: string
}