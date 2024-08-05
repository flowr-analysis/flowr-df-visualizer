import { useRef } from "react";
import { edgeTypeToMarkerIdMapper, edgeTypeToSymbolIdMapper } from "./model/edges/multiEdge";
import { SideEffectOnCallEdge } from "./model/edges/sideEffectOnCallEdge";
import { ViewModel } from "./model/viewModel";


interface LegendComponentProps {
    viewModel: ViewModel
}

export function slideInLegend() {
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.classList.toggle('visible');
}

export function slideOutLegend(){
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.classList.toggle('visible');
}

export const LegendComponent: React.FC<LegendComponentProps> = ({viewModel}) => {
    

    const isGreyedOutMap = viewModel.isGreyedOutMap
    
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

interface EdgeLegendComponentProps {
    edgeType:string
    edgeText:string
    isGreyedOutMap:Map<string,boolean>
}


const EdgeLegendComponent: React.FC<EdgeLegendComponentProps> = ({edgeText, edgeType, isGreyedOutMap}) => {
    const classNameEdge = edgeType + '-edge' + ' legend-edge' + ' ' + edgeType + '-legend-edge'
    const classNameInteractiveEdge = edgeType + '-legend-interactive-edge' + ' legend-interactive-edge' 
    const markerId = edgeTypeToMarkerIdMapper(edgeType)
    const legendId = edgeType + '-legend'
    return(<svg
        id={legendId}
        onClick={() => {
            const pathElements = document.getElementsByClassName(`${edgeType}-edge`) as HTMLCollectionOf<SVGPathElement>
            const symbolElements = document.getElementsByClassName(`${edgeType}-edge-symbol`) as HTMLCollectionOf<SVGUseElement>
            const legendSVGElement = document.getElementById(legendId) as HTMLElement
            
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
            legendSVGElement.classList.toggle('legend-passive', !isEdgeTypeGreyedOut)
        }}
    >
        <path className={classNameEdge} d='m0 10 l20 0 l20 0 l20 0 l20 0' markerEnd='url(#triangle)' markerMid={`url(#${markerId})`} ></path>
        <path className = {classNameInteractiveEdge} d='m0 10 l80 0' ></path>
        
        <text x = {92} y = {15}>{edgeText}</text>
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
