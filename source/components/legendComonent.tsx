import { useRef } from "react";
import { edgeTypeToSymbolIdMapper } from "./model/edges/multiEdge";
import { SideEffectOnCallEdge } from "./model/edges/sideEffectOnCallEdge";


interface LegendComponentProps {
    
}

export function slideInLegend() {
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.classList.toggle('visible');
}

export function slideOutLegend(){
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.classList.toggle('visible');
}

export const LegendComponent: React.FC<LegendComponentProps> = ({}) => {
    
    const edgeTypes = ['reads', 'defined-by','calls','returns','defines-on-call','defined-by-on-call', 'argument', 'side-effect-on-call', 'non-standard-evaluation']
    
    /*
    const tempRule = 'body:has(.reads-legend-edge-interactive:hover) .function-call-node {opacity:20%}body:has(.reads-legend-edge-interactive:hover) .use-node{opacity:20%}'
    let cssRule = ''
    const greyOutStyle = '{opacity: 20%}'
    const keepNormalStyle = '{opacity: 100%}'
    
    const nodeTypes = ['variable-definition-node', 'function-definition-node','value-node', 'function-call-node', 'use-node','exit-point-node']
    nodeTypes.forEach((hoveredNodeType) => {
        nodeTypes.forEach((toHideNodeType) => {
            if(hoveredNodeType === toHideNodeType){
                return
            }
            cssRule += `body:has(.${hoveredNodeType}-legend:hover) .${toHideNodeType} ${greyOutStyle}`
        })
        edgeTypes.forEach((toHideEdgeType) => {
            //hide edge line
            cssRule += `body:has(.${hoveredNodeType}-legend:hover) .${toHideEdgeType}-edge ${greyOutStyle}`
            //hide edge symbol
            cssRule += `body:has(.${hoveredNodeType}-legend:hover) .${toHideEdgeType}-edge-symbol ${greyOutStyle}`
        })
        //cssRule += `body:has(.${hoveredNodeType}-legend:hover) .${hoveredNodeType} {opacity: 100%}`
    })
    edgeTypes.forEach((hoveredEdgeType)=>{
        nodeTypes.forEach((toHideNodeType)=> {
            cssRule += `body:has(.${hoveredEdgeType}-legend-edge-interactive:hover) .${toHideNodeType} ${greyOutStyle}`
        })
        edgeTypes.forEach((toHideEdgeType) => {
            if(hoveredEdgeType === toHideEdgeType){
                return
            }
            //hide edge line
            cssRule += `body:has(.${hoveredEdgeType}-legend-edge-interactive:hover) .${toHideEdgeType}-edge ${greyOutStyle}`
            //hide edge symbol
            cssRule += `body:has(.${hoveredEdgeType}-legend-edge-interactive:hover) .${toHideEdgeType}-edge-symbol ${greyOutStyle}`
        })
        cssRule += `body:has(.${hoveredEdgeType}-legend-edge-interactive:hover) .${hoveredEdgeType}-edge ${keepNormalStyle}`
    })
    */
    const isGreyedOutMap = new Map<string,boolean>()
    
    return (
        <div className = 'slide-in-legend' id = 'slide-in-legend' >
            <div className='legend-nodes'>
                <NodeLegendComponent isGreyedOutMap = {isGreyedOutMap} nodeType = 'variable-definition'/>
                <NodeLegendComponent isGreyedOutMap = {isGreyedOutMap} nodeType = 'function-definition'/>
                <NodeLegendComponent isGreyedOutMap = {isGreyedOutMap} nodeType = 'value'/>
                <NodeLegendComponent isGreyedOutMap = {isGreyedOutMap} nodeType = 'function-call'/>
                <NodeLegendComponent isGreyedOutMap = {isGreyedOutMap} nodeType = 'use'/>
                <NodeLegendComponent isGreyedOutMap = {isGreyedOutMap} nodeType = 'exit-point'/>
            </div>
            <div className='legend-edges'>
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType = 'reads' edgeText='reads' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='defined-by' edgeText='defined-by' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='calls' edgeText='calls' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='returns' edgeText='returns' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='defines-on-call' edgeText='defines-on-call' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='defined-by-on-call' edgeText='defined-by-on-call' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='argument' edgeText='argument' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='side-effect-on-call' edgeText='side-effect-on-call' />
                <EdgeLegendComponent isGreyedOutMap = {isGreyedOutMap} edgeType='non-standard-evaluation' edgeText='non-standard-evaluation' />
            </div>
            
            <div id = 'legend-close-button-div'>
                <button className = {'button-close-legend'} onClick = {slideOutLegend} >X</button>
            </div>
        </div>
    )
}

interface SymbolComponentProps {
    symbolId: string
    edgeType:string
}

const SymbolComponent: React.FC<SymbolComponentProps> = ({symbolId,edgeType}) => {
    return(<>
        <use className = {edgeType + '-edge-symbol'} key = {'legend-symbol-1' + symbolId} href = {`#${symbolId}`} x = {20} y = {10}></use>
        <use className = {edgeType + '-edge-symbol'} key = {'legend-symbol-2' + symbolId} href = {`#${symbolId}`} x = {40} y = {10}></use>
        <use className = {edgeType + '-edge-symbol'} key = {'legend-symbol-3' + symbolId} href = {`#${symbolId}`} x = {60} y = {10}></use>
    </>    
    )
}

interface EdgeLegendComponentProps {
    edgeType:string
    edgeText:string
    isGreyedOutMap:Map<string,boolean>
}


const EdgeLegendComponent: React.FC<EdgeLegendComponentProps> = ({edgeText, edgeType, isGreyedOutMap}) => {
    const classNameEdge = edgeType + '-edge'
    const classNameInteractiveEdge = edgeType + '-legend-edge-interactive' 
    const symbolId = edgeTypeToSymbolIdMapper(edgeType)
    
    return(<svg
        id={edgeType + '-legend'}
        onClick={() => {
            const pathElements = document.getElementsByClassName(`${edgeType}-edge`) as HTMLCollectionOf<SVGPathElement>
            const symbolElements = document.getElementsByClassName(`${edgeType}-edge-symbol`) as HTMLCollectionOf<SVGUseElement>

            //get the greyed out state and set it correctly
            const isEdgeTypeGreyedOut:boolean = isGreyedOutMap.get(edgeType) ?? false
            isGreyedOutMap.set(edgeType,!isEdgeTypeGreyedOut)

            //for all elements set the node state
            for(const element of pathElements){
                element.classList.toggle('legend-passive', !isEdgeTypeGreyedOut)
            }
            
            for(const element of symbolElements){
                element.classList.toggle('legend-passive', !isEdgeTypeGreyedOut)
            }
        }}
    >
        <path className={edgeType + '-legend-edge' + ' ' + classNameEdge} d='m0 10 l80 0' markerEnd='url(#triangle)' style={{stroke:'black', strokeWidth: 1}}></path>
        <path className = {classNameInteractiveEdge} d='m0 10 l80 0' style={{pointerEvents:'all', strokeWidth: 200}}></path>
        <SymbolComponent edgeType = {edgeType} symbolId= {symbolId}/>
        <text style = {{pointerEvents: 'all'}} className = {classNameInteractiveEdge + ' ' + classNameEdge} x = {92} y = {15}>{edgeText}</text>
    </svg>)
}  

interface NodeLegendComponentProps{
    nodeType:string
    isGreyedOutMap: Map<string,boolean>    
}

const NodeLegendComponent: React.FC<NodeLegendComponentProps> = ({nodeType, isGreyedOutMap}) => {
    return (
        <div onClick = {() => {
            const elements = document.getElementsByClassName(`${nodeType}-node`) as HTMLCollectionOf<HTMLDivElement>
            //get the greyed out state and set it correctly
            const isNodeTypeGreyedOut:boolean =  isGreyedOutMap.get(nodeType) ?? false
            isGreyedOutMap.set(nodeType,!isNodeTypeGreyedOut)
            //for all elements set the node state
            for(const element of elements){
                element.classList.toggle('legend-passive', !isNodeTypeGreyedOut)
            }
        }}className={`legend-element ${nodeType}-node ${nodeType}-node-legend`}>{nodeType}</div>
    )
}
