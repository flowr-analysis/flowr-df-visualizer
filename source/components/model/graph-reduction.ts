import { Children } from "react";
import { visualStateModel } from "../..";
import { setEdgesExternal, setNodesExternal } from "../graph-viewer";
import { addEdge, Edge, Node } from "@xyflow/react";
import { EdgeTypeName } from "@eagleoutice/flowr/dataflow/graph/edge";
import { generateEdge } from "./graph-builder";
import { EdgeInfo, VisualStateModel } from "./visual-state-model";
import { TwoKeyMap } from "../utility/two-key-map";
import { transformBuildedEdgesToShowEdges } from "./graph-transition";
import { resizeParents } from "./nodes/parent-resizer";

let combineEdgeIdIndex = 1

export function reduceOnFunctionDefinitionNode(reduceNodeId: string):void{
    const deletedChildrenArray: string[] = determineChildNodes(reduceNodeId)
    reduceGeneral(reduceNodeId, deletedChildrenArray)
}

/**
 * returns all child nodes and also children's children (recursive)
 * @param reduceNodeId 
 * @param currentNodeId node 
 * @returns array of all child nodes that has parents in front of children in the array
 */
function determineChildNodes(currentNodeId: string): string[]{
    const childrenArray = visualStateModel.alteredNodeChildrenMap.getKey1Map(currentNodeId)
    let childArray: string[] = []

    //If this node has children also reduce this one
    childrenArray?.forEach((dummyValue, childId) => {
        childArray = childArray.concat(determineChildNodesHelper(childId))
    })

    return childArray
}


/**
 * helper function to not include the parent in
 * @param currentNodeId 
 * @returns 
 */
function determineChildNodesHelper(currentNodeId:string):string[]{
    const childrenArray = visualStateModel.alteredNodeChildrenMap.getKey1Map(currentNodeId)
    let childArray: string[] = [currentNodeId]

    //If this node has children also reduce this one
    childrenArray?.forEach((dummyValue, childId) => {
        childArray = childArray.concat(determineChildNodesHelper(childId))
    })

    return childArray
}

function setReducedNodeMapping(reduceNodeId: string, childReduceNodeId: string): void{
    if(reduceNodeId !== childReduceNodeId){
        visualStateModel.reducedToNodeMapping.set(childReduceNodeId, reduceNodeId)
        const currentMapIndex = visualStateModel.nodeContainsReducedNodes.getKey1Map(reduceNodeId)?.size ?? 0
        visualStateModel.nodeContainsReducedNodes.set(reduceNodeId, childReduceNodeId, currentMapIndex)
    }
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
            
            //get origin edges
            const originEdgesArray = hasAlreadyBeenReduced ? 
                                     (visualStateModel.combinedEdges.get(currentEdge.source, currentEdge.target) ?? []) :
                                     [{source: currentEdge.source, target: currentEdge.target, edgeTypes:currentEdge.data?.edgeTypes as Set<EdgeTypeName>?? new Set<EdgeTypeName>()}]
            
            if(isInsideReduction){
                visualStateModel.combinedEdges.delete(currentEdge.source, currentEdge.target)
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

                    if(!deleteEdgesMap.has(currentEdge.source, reduceNodeId)){
                        deletedEdges.push({source: currentEdge.source, target: reduceNodeId})
                        deleteEdgesMap.set(currentEdge.source, reduceNodeId, true)
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
            
            //get origin edges
            const originEdgesArray = hasAlreadyBeenReduced ? 
                                     (visualStateModel.combinedEdges.get(currentEdge.source, currentEdge.target) ?? []) :
                                     [{source: currentEdge.source, target: currentEdge.target, edgeTypes:currentEdge.data?.edgeTypes as Set<EdgeTypeName> ?? new Set<EdgeTypeName>()}]
                
            if(isInsideReduction){
                visualStateModel.combinedEdges.delete(currentEdge.source, currentEdge.target)
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
                        originEdgesArray.push({source:reduceNodeId, target: currentEdge.target, edgeTypes: visualStateModel.alteredEdgeConnectionMap.get(reduceNodeId, currentEdge.target) ?? new Set<EdgeTypeName>()})
                        visualStateModel.combinedEdges.set(reduceNodeId, currentEdge.target, originEdgesArray)
                    }

                    if(!deleteEdgesMap.has(reduceNodeId, currentEdge.target)){
                        deletedEdges.push({source: reduceNodeId, target: currentEdge.target})
                        deleteEdgesMap.set(reduceNodeId, currentEdge.target, true)
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

export function expandOnFunctionCallNode(reduceNodeId: string):void{
    
    expandGeneral(reduceNodeId)
}




export function nodeReduction(reduceNodeId: string):void{
    
}


function traceToUnreducedNode(nodeId: string):string{
    let currentId:string = nodeId
    while(visualStateModel.deletedNodes.has(currentId)){
        if(!visualStateModel.reducedToNodeMapping.has(currentId)){ throw new Error('Node is deleted but has no tracing')}
        currentId = visualStateModel.reducedToNodeMapping.get(currentId) ?? currentId
    }
    return currentId
}

function transformAddEdges(toAddEdges:EdgeSourceTarget[]):Edge[]{
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

    return transformedEdges
}

export function reduceAll(reduceNodeId: string){

}


export function expandGeneral(reduceNodeId: string):void{

    //reduced Nodes
    const reducedNodeIdsMap = visualStateModel.nodeContainsReducedNodes.getKey1Map(reduceNodeId) ?? new Map<string,number>() 
    const reducedNodeIds:string[] = []
    reducedNodeIdsMap.forEach((index, reducedNodeId)=>{
        reducedNodeIds.push(reducedNodeId)
    })
    reducedNodeIds.sort((firstId, secondId) => {
        const firstIndexValue = reducedNodeIdsMap.get(firstId) ?? 0
        const secondIndexValue = reducedNodeIdsMap.get(secondId) ?? 0
        return firstIndexValue - secondIndexValue
    })
    
    //correct model for reduce node
    const reduceNodeChildrenMap = visualStateModel.originalNodeChildrenMap.getKey1Map(reduceNodeId)
    if(reduceNodeChildrenMap !== undefined){
        reduceNodeChildrenMap.forEach((dummyValue, childId) => {
            if(reducedNodeIdsMap.has(childId)){
                visualStateModel.alteredNodeChildrenMap.set(reduceNodeId, childId, true)
            }
        })
    }

    
    //nodes no longer reduced
    visualStateModel.nodeContainsReducedNodes.deleteKey1(reduceNodeId)

    //correct model for node children
    reducedNodeIds.forEach((nodeId) => {
        visualStateModel.reducedToNodeMapping.delete(nodeId)
        const parentId = visualStateModel.childToParentMap.get(nodeId)
        if(parentId !== undefined){
            visualStateModel.alteredNodeChildrenMap.set(parentId, nodeId, true)
        }
    })
    
    //include reduced nodes back again in graph
    const nodeObjects:Node[] = []
    reducedNodeIds.forEach((nodeId) => {
        const nodeToReinstate = visualStateModel.deletedNodes.get(nodeId)
        if(nodeToReinstate !== undefined){
            nodeObjects.push(nodeToReinstate)
        }
        visualStateModel.deletedNodes.delete(nodeId)
    })

    setNodesExternal((nodes) => {
        const newNodesArray = nodes.concat(nodeObjects)
        newNodesArray.forEach((node) => visualStateModel.nodeMap.set(node.id, node))
        return newNodesArray
    })
    const parentChildNodes = [reduceNodeId].concat(reducedNodeIds)
    resizeParents(parentChildNodes, visualStateModel)

    const deletedEdges:EdgeSourceTarget[] = [] //delete combined edges that go from and to the reduction node
    const deleteEdgesMap: TwoKeyMap<string, string, boolean> = new TwoKeyMap<string, string, boolean>()
    const listOfEdgesToLookAt:EdgeInfo[] = [] //Array of origin edges to reapply
    const listOfUncombinedDeletedEdgesToAdd:EdgeInfo[] = []
    visualStateModel.alteredEdgeConnectionMap.getKey1Map(reduceNodeId)?.forEach((outgoingEdgeTypeSet, targetNodeId) => {
        if(visualStateModel.combinedEdges.has(reduceNodeId, targetNodeId)){
            listOfEdgesToLookAt.push(...(visualStateModel.combinedEdges.get(reduceNodeId, targetNodeId) ?? []))
            visualStateModel.combinedEdges.delete(reduceNodeId, targetNodeId)
            deletedEdges.push({source: reduceNodeId, target:targetNodeId})

        }
    })
    visualStateModel.alteredReversedEdgeConnectionMap.getKey1Map(reduceNodeId)?.forEach((someBool, sourceNodeId) => {
        if(visualStateModel.combinedEdges.has(sourceNodeId, reduceNodeId)){
            listOfEdgesToLookAt.push(...(visualStateModel.combinedEdges.get(sourceNodeId, reduceNodeId) ?? []))
            visualStateModel.combinedEdges.delete(sourceNodeId, reduceNodeId)
            deletedEdges.push({source: sourceNodeId, target:reduceNodeId})

        }
    })
    //delete the deleted combined edges from the model
    deletedEdges.forEach((sourceTarget) => {
        visualStateModel.alteredEdgeConnectionMap.delete(sourceTarget.source, sourceTarget.target)
        visualStateModel.alteredReversedEdgeConnectionMap.delete(sourceTarget.target, sourceTarget.source)
        deleteEdgesMap.set(sourceTarget.source, sourceTarget.target, true)
    })

    const toAddEdges: EdgeSourceTarget[] = []
    const addEdgesMap: TwoKeyMap<string, string, boolean> = new TwoKeyMap<string, string, boolean>()
    visualStateModel.unCombinedDeletedEdges.forEach((edgesInfo) => {
        const reducedSource = traceToUnreducedNode(edgesInfo.source)
        const reducedTarget = traceToUnreducedNode(edgesInfo.target)
        if(reducedSource !== reducedTarget){
            listOfUncombinedDeletedEdgesToAdd.push(edgesInfo)
        }
    })
    listOfUncombinedDeletedEdgesToAdd.forEach((edgesInfo) => {
        visualStateModel.unCombinedDeletedEdges.delete(edgesInfo.source, edgesInfo.target)
    })
    listOfEdgesToLookAt.push(...listOfUncombinedDeletedEdgesToAdd)
    listOfEdgesToLookAt.forEach((edgesInfo) => {
        const reducedSource = traceToUnreducedNode(edgesInfo.source)
        const reducedTarget = traceToUnreducedNode(edgesInfo.target)
        const hasEdgeWithSameTarget = visualStateModel.alteredEdgeConnectionMap.has(reducedSource, reducedTarget)
        const originEdgesArray = [edgesInfo]
        if(hasEdgeWithSameTarget){
            const isTargetCombinedEdge = visualStateModel.combinedEdges.has(reducedSource, reducedTarget) 
            if(isTargetCombinedEdge){
                //combine origin edges
                const allCombinedEdges = originEdgesArray.concat(visualStateModel.combinedEdges.get(reducedSource, reducedTarget) ?? [])
                visualStateModel.combinedEdges.set(reducedSource, reducedTarget, allCombinedEdges)
                deletedEdges.push({source: reducedSource, target: reducedTarget})
            }else {                      
                originEdgesArray.push({source:reducedSource, target: reducedTarget, edgeTypes: visualStateModel.alteredEdgeConnectionMap.get(reducedSource, reducedTarget) ?? new Set<EdgeTypeName>()})
                visualStateModel.combinedEdges.set(reducedSource, reducedTarget, originEdgesArray)
            }

            if(!deleteEdgesMap.has(reducedSource, reducedTarget)){
                deletedEdges.push({source: reducedSource, target: reducedTarget})
                deleteEdgesMap.set(reducedSource, reducedTarget, true)
            }
        } else {
            visualStateModel.combinedEdges.set(reducedSource, reducedTarget, originEdgesArray)
        }
        if(!addEdgesMap.has(reducedSource, reducedTarget)){
            toAddEdges.push({source:reducedSource, target:reducedTarget})
            addEdgesMap.set(reducedSource, reducedTarget, true)
        }
    })

    //delete the deleted combined edges from the model
    deletedEdges.forEach((sourceTarget) => {
        visualStateModel.alteredEdgeConnectionMap.delete(sourceTarget.source, sourceTarget.target)
        visualStateModel.alteredReversedEdgeConnectionMap.delete(sourceTarget.target, sourceTarget.source)
    })
    //delete necessary edges from the graph
    setEdgesExternal(
        (edges) => edges.filter(
            (edge) => deletedEdges.find(
                (deleteEdgeInfo) => (deleteEdgeInfo.source === edge.source && deleteEdgeInfo.target === edge.target)) === undefined
        )
    )
    //add all edges back to the graph
    const newEdgesArray = transformAddEdges(toAddEdges)
    //add the new Edges to the Graph
    setEdgesExternal((edges) => edges.concat(newEdgesArray))
    resetNodeNames(reducedNodeIds.concat([reduceNodeId]))
}

/**
 * sets the underlying model correctly and updates the view
 * @param reduceNodeId node to reduce to
 * @param allReducedNodeIdsArray all to reduced nodes
 */
function reduceGeneral(reduceNodeId: string, allReducedNodeIdsArray: string[]){

    visualStateModel.alteredNodeChildrenMap.deleteKey1(reduceNodeId)

    //parents need to be in front of the children in the array
    allReducedNodeIdsArray.sort((firstId, secondId) => {
        if(visualStateModel.originalNodeChildrenMap.has(firstId, secondId)){
            return -1
        } else if(visualStateModel.originalNodeChildrenMap.has(secondId, firstId)){
            return 1
        }
        return 0
    })

    //correct Child Mapping
    allReducedNodeIdsArray.forEach((nodeId) => {
        if(visualStateModel.childToParentMap.has(nodeId)){
            const parentId = visualStateModel.childToParentMap.get(nodeId) ?? ''
            visualStateModel.alteredNodeChildrenMap.delete(parentId, nodeId)
        }
        setReducedNodeMapping(reduceNodeId, nodeId)
    })

    //delete Nodes from Array
    setNodesExternal((nodes) => nodes.filter((node) => {
        const doesNodeStayInArray = allReducedNodeIdsArray.find((deletedChildId) => deletedChildId === node.id) === undefined
        if(!doesNodeStayInArray){
            visualStateModel.deletedNodes.set(node.id , node)
        }
        return doesNodeStayInArray
    }))

    updateEdges(reduceNodeId,allReducedNodeIdsArray,visualStateModel.alteredGraph?.edges ?? [])
    changeLabelAccordingToReduction(reduceNodeId)
}



function changeLabelAccordingToReduction(reduceNodeId:string){
    const atomicReducedNodes = getAllReducedNodes(reduceNodeId)
    const locationMap = visualStateModel.locationMap
    const inputTextSplitPerLine = visualStateModel.currentGraphTextInput.split('\n')
    //sort by column and line number
    atomicReducedNodes.sort((firstId, secondId) => {
        //no location data available
        if(!locationMap.has(firstId) && !locationMap.has(secondId)){
            return 0
        }
        if(!locationMap.has(firstId)){
            return -1
        }
        if(!locationMap.has(secondId)){
            return 1
        }
        const firstLocationArray = locationMap.get(firstId) ?? [0,0,0,0]
        const secondLocationArray = locationMap.get(secondId) ?? [0,0,0,0]

        //check if one line number is greater than other
        if(firstLocationArray[0] < secondLocationArray[0]){
            return -1
        } 
        if(firstLocationArray[0] > secondLocationArray[0]){
            return 1
        } 
        //line numbers are equal check if line number of one is greater than the other
        if(firstLocationArray[1] < secondLocationArray[1]){
            return -1
        } 
        if(firstLocationArray[1] > secondLocationArray[1]){
            return 1
        }

        //both values are equal
        return 0
    })
    const newLabel = createNewLabelFromGivenReducedNodes(atomicReducedNodes, inputTextSplitPerLine)

    //notify reactflow about changes by creating new node object
    setNodesExternal((nodes) => nodes.map((node) => {
        if(node.id === reduceNodeId){
            return {
                ...node,
                data:{
                    ...node.data,
                    label: newLabel
                }
            }
        }
        return node
    }))
    
    
}

function createNewLabelFromGivenReducedNodes(sortedIds: string[], inputTextLineSeparated: string[]):string{
    //TODO finish
    const locationMap = visualStateModel.locationMap
    
    let currentLineNumber = 1
    let currentPositionInLine = 1
    let endLastIndexLineNumber = 1
    let endLastIndexPositionInLine = 1
    let currentIndexSortedIds = 0
    
    let newLabel = ''
    while(currentIndexSortedIds < sortedIds.length && !locationMap.has(sortedIds[currentIndexSortedIds])){
        currentIndexSortedIds++
    }

    let currentNodeLocation = [0,0,0,0]
    if(currentIndexSortedIds < sortedIds.length){
        currentNodeLocation = locationMap.get(sortedIds[currentIndexSortedIds]) ?? [0,0,0,0]
    }

    currentLineNumber = currentNodeLocation[0]
    currentPositionInLine = currentNodeLocation[1]
    endLastIndexLineNumber = currentLineNumber
    endLastIndexPositionInLine = currentPositionInLine

    while(currentIndexSortedIds < sortedIds.length && 
        (currentLineNumber < inputTextLineSeparated.length || (currentLineNumber === inputTextLineSeparated.length && currentPositionInLine <= inputTextLineSeparated[currentLineNumber - 1].length))){
        currentNodeLocation = locationMap.get(sortedIds[currentIndexSortedIds]) ?? [0,0,0,0]
        currentLineNumber = currentNodeLocation[0]
        currentPositionInLine = currentNodeLocation[1]

        const shouldAddText = onlySeparationFreeCharactersInTextPassage(endLastIndexLineNumber, endLastIndexPositionInLine, currentLineNumber, currentPositionInLine, inputTextLineSeparated)
        if(shouldAddText){
            newLabel += getPassageFromText(endLastIndexLineNumber, endLastIndexPositionInLine, currentLineNumber, currentPositionInLine, inputTextLineSeparated)
        } else {
            //signal that nodes are in between here that do not belong to reduction 
            newLabel += '||$||' 
        }
        newLabel += visualStateModel.lexemeMap.get(sortedIds[currentIndexSortedIds]) ?? ''
        endLastIndexLineNumber = currentNodeLocation[2]
        endLastIndexPositionInLine = currentNodeLocation[3]
        currentIndexSortedIds++
    }
    return newLabel
}

function onlySeparationFreeCharactersInTextPassage(startLineNumberExclusive: number, startPositionInLineExclusive: number, endLineNumberExclusive: number, endPositionInLineExclusive: number, text: string[]):boolean{
    
    //if start equals end or end exceeds start text in between is nonexistent
    if( startLineNumberExclusive > endLineNumberExclusive || (startLineNumberExclusive === endLineNumberExclusive && startPositionInLineExclusive >= endLineNumberExclusive)){
        return true
    }

    let currentLine = startLineNumberExclusive
    let currentPositionInLine = startPositionInLineExclusive
    const allowedSymbols = [' ', '\n', '\t', '\{', '\(', '\}', '\)'];
    
    ({lineNumber: currentLine, positionInLine: currentPositionInLine} = nextPositionInText(currentLine, currentPositionInLine, text))

    while(currentLine < endLineNumberExclusive || (currentLine === endLineNumberExclusive && currentPositionInLine < endPositionInLineExclusive)){
        // check if text only contains allowed characters
        const currentCharacter = text[currentLine - 1].at(currentPositionInLine - 1)
        if(allowedSymbols.find((symbol) => symbol === currentCharacter) === undefined){
            return false
        }
        //go to next position
        ({lineNumber: currentLine, positionInLine: currentPositionInLine} = nextPositionInText(currentLine, currentPositionInLine, text))
    }

    return true
}

function nextPositionInText(lineNumber: number, positionInLine: number, text: string[]):{lineNumber: number, positionInLine: number}{
    /*
    if(lineNumber === text.length && positionInLine === text[text.length - 1].length){
        return{lineNumber, positionInLine}
    }
    */

    if(positionInLine === text[lineNumber - 1].length){
        lineNumber++
        positionInLine = 1
    } else {
        positionInLine++
    }
    return {lineNumber: lineNumber, positionInLine: positionInLine}
}


function getPassageFromText(startLineNumberExclusive: number, startPositionInLineExclusive: number, endLineNumberExclusive: number, endPositionInLineExclusive: number, text: string[]):string{
    let {lineNumber: currentLineNumber, positionInLine: currentPositionInLine} = nextPositionInText(startLineNumberExclusive, startPositionInLineExclusive, text)
    let passage = ''
    let hasSpace = false
    while(currentLineNumber < endLineNumberExclusive || (currentLineNumber === endLineNumberExclusive && currentPositionInLine < endPositionInLineExclusive)){
        const nextCharacter = text[currentLineNumber - 1].at(currentPositionInLine - 1) ?? ''
        //ignore multiple spaces in a row
        if(nextCharacter !== ' '){
            passage += nextCharacter
            hasSpace = false
        } else if(nextCharacter === ' ' && !hasSpace){
            passage += nextCharacter
            hasSpace = true
        }

        const {lineNumber: nextLineNumber, positionInLine: nextPositionInLine} = nextPositionInText(currentLineNumber, currentPositionInLine, text)
        
        if(currentLineNumber !== nextLineNumber){
            passage += (hasSpace ? '' : ' ') + '\\n '
        }

        currentLineNumber = nextLineNumber
        currentPositionInLine = nextPositionInLine
    }
    
    return passage
}

function getAllReducedNodes(currentNode: string):string[]{
    let containedNodes: string[] = [currentNode]
    if(!visualStateModel.nodeContainsReducedNodes.hasKey1(currentNode)){
        return containedNodes
    }
    const currentNodeChildren = visualStateModel.nodeContainsReducedNodes.getKey1Map(currentNode) ?? new Map<string, number>()
    currentNodeChildren.forEach((dummyValue, childId) => {
        containedNodes = containedNodes.concat(getAllReducedNodes(childId))
    })

    return containedNodes
}

function resetNodeNames(nameResetNodeIds:string[]){
    const renameMap = new Map<string,string>()
    nameResetNodeIds.forEach((nodeId) => {
        const isReduced = visualStateModel.nodeContainsReducedNodes.hasKey1(nodeId)
        if(isReduced){
            changeLabelAccordingToReduction(nodeId)
        } else {
            const originalLexeme = visualStateModel.lexemeMap.get(nodeId) ?? ''
            renameMap.set(nodeId, originalLexeme)
        }
        
    })
    setNodesExternal((nodes) => nodes.map((node) => {
        if(renameMap.has(node.id)){
            return {
                ...node,
                data:{
                    ...node.data,
                    label: renameMap.get(node.id)
                }
            }
        }
        return node
    }))
}


export function reduceAllNodesDirectlyPointedAt(reduceNodeId:string){
    const allNeighbors = visualStateModel.alteredEdgeConnectionMap.getKey1Map(reduceNodeId)
    let toReduceNodes: string[] = []
    let toReduceNodesMap: Map<string,boolean> = new Map<string,boolean>()  
    if(allNeighbors !== undefined){
        allNeighbors.forEach((dummyValue, neighborId) => {
            if(!toReduceNodesMap.has(neighborId)){
                toReduceNodes.push(neighborId)
                toReduceNodesMap.set(neighborId, true)
                const neighborChildren = determineChildNodes(neighborId)
                neighborChildren.forEach((childId) => {
                    if(!toReduceNodesMap.has(childId)){
                        toReduceNodes.push(childId)
                        toReduceNodesMap.set(childId, true)
                    }
                })
            }
        })
    }
    reduceGeneral(reduceNodeId, toReduceNodes)
}