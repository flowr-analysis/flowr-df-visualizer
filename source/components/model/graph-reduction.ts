import { Children } from "react";
import { visualStateModel } from "../..";
import { setEdgesExternal, setNodesExternal } from "../graph-viewer";

export function reduceOnFunctionDefinitionNode(nodeId: string){
    const childrenArray = visualStateModel.alteredNodeChildrenMap?.get(nodeId)
    childrenArray?.forEach((childId) => {
        deleteChildrenAccordingly(nodeId, childId)
    })
}

function deleteChildrenAccordingly(reduceNodeId: string, currentNodeId: string){
    const childrenArray = visualStateModel.alteredNodeChildrenMap?.get(currentNodeId)
    //If this node has children also reduce this one
    childrenArray?.forEach((childId) => {
        deleteChildrenAccordingly(reduceNodeId, childId)
    })

    //set all incoming and outgoing edges to reduceNode
    setEdgesExternal((edges) => edges.map((edge) => {
        //correct target of edge to reduce node
        if(edge.target === currentNodeId){
            edge.target = reduceNodeId
            //set new target
            const targetArray = visualStateModel.alteredEdgeConnectionMap?.get(edge.source)?.filter((id) => id !== currentNodeId)
            targetArray?.push(reduceNodeId)
            visualStateModel.alteredEdgeConnectionMap?.set(edge.source, targetArray ?? [])
            return edge
        }

        //correct source of edge to reduce node
        if(edge.source === currentNodeId){
            edge.source = reduceNodeId
            const targetArray = visualStateModel.alteredEdgeConnectionMap?.get(currentNodeId)
            if(targetArray !== undefined){
                visualStateModel.alteredEdgeConnectionMap?.delete(currentNodeId)
                if(!visualStateModel.alteredEdgeConnectionMap?.has(reduceNodeId)){
                    visualStateModel.alteredEdgeConnectionMap?.set(reduceNodeId, [])
                }
                const reduceNodeTargetArray = visualStateModel.alteredEdgeConnectionMap?.get(reduceNodeId)
                reduceNodeTargetArray?.concat(targetArray)
            }
            return edge
        }

        return edge
    }))

    //delete this Node
    setNodesExternal((nodes) => nodes.filter((node) => node.id !== currentNodeId))
    
    //remember which node was reduced to which
    visualStateModel.reducedToNodeMapping?.set(currentNodeId, reduceNodeId)
    if(!visualStateModel.nodeContainsReducedNodes?.has(reduceNodeId)){
        visualStateModel.nodeContainsReducedNodes?.set(reduceNodeId, [])
    }
    visualStateModel.nodeContainsReducedNodes?.get(reduceNodeId)?.push(currentNodeId)
}