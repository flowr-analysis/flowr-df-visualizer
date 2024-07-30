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

export const LegendComponent: React.FC<LegendComponentProps> = (props) => {
    //make cssRules
    const nodeTypes = ['variable-definition-node', 'function-definition-node','value-node', 'function-call-node', 'use-node','exit-point-node']
    const edgeTypes = ['reads', 'defined-by','calls','returns','defines-on-call','defined-by-on-call', 'argument', 'side-effect-on-call', 'non-standard-evaluation']
    const tempRule = 'body:has(.reads-legend-edge-interactive:hover) .function-call-node {opacity:20%}body:has(.reads-legend-edge-interactive:hover) .use-node{opacity:20%}'
    let cssRule = ''
    const greyOutStyle = '{opacity: 20%}'
    const keepNormalStyle = '{opacity: 100%}'
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
    
    const readsEdgeSymbolId = edgeTypeToSymbolIdMapper('reads')
    const definedByEdgeSymbolId = edgeTypeToSymbolIdMapper('defined-by')
    const callsEdgeSymbolId = edgeTypeToSymbolIdMapper('calls')
    const returnsEdgeSymbolId = edgeTypeToSymbolIdMapper('returns')
    const definesOnCallEdgeSymbolId = edgeTypeToSymbolIdMapper('defines-on-call')
    const definedByOnCallEdgeSymbolId = edgeTypeToSymbolIdMapper('defined-by-on-call')
    const argumentEdgeSymbolId = edgeTypeToSymbolIdMapper('argument')
    const sideEffectOnCallEdge = edgeTypeToSymbolIdMapper('side-effect-on-call')
    const nonStandardEvaluationEdge = edgeTypeToSymbolIdMapper('non-standard-evaluation')

    return (
        <div className = 'slide-in-legend' id = 'slide-in-legend' >
            <div className='variable-definition-node variable-definition-node-legend' style={{position: 'absolute',top: 0,  left: 10, display: 'inline-block'}}>variable-definition</div>
            <div className='function-definition-node function-definition-node-legend' style={{position: 'absolute',top: 38,  left: 4, display: 'inline-block'}}>function-definition</div>
            <div className='value-node value-node-legend' style={{position: 'absolute',top: 90,  left: 10, display: 'inline-block'}}>value-node</div>
            <div className='function-call-node function-call-node-legend' style={{position: 'absolute',top: 130,  left: 10, display: 'inline-block'}}>function-call</div>
            <div className='use-node use-node-legend' style={{position: 'absolute',top: 170,  left: 10, display: 'inline-block'}}>use</div>
            <div className='exit-point-node exit-point-node-legend' style={{position: 'absolute',top: 210,  left: 10, display: 'inline-block'}}>exit-point</div>
            
            <EdgeLegendComponent symbolId={readsEdgeSymbolId} edgeType = 'reads' edgeText='reads' fromTop={0} fromLeft={200}/>
            <EdgeLegendComponent symbolId={definedByEdgeSymbolId} edgeType='defined-by' edgeText='defined-by' fromTop={20} fromLeft={200}/>
            <EdgeLegendComponent symbolId={callsEdgeSymbolId} edgeType='calls' edgeText='calls' fromTop={40} fromLeft={200}/>
            <EdgeLegendComponent symbolId={returnsEdgeSymbolId} edgeType='returns' edgeText='returns' fromTop={60} fromLeft={200}/>
            <EdgeLegendComponent symbolId={definesOnCallEdgeSymbolId} edgeType='defines-on-call' edgeText='defines-on-call' fromTop={80} fromLeft={200}/>
            <EdgeLegendComponent symbolId={definedByOnCallEdgeSymbolId} edgeType='defined-by-on-call' edgeText='defined-by-on-call' fromTop={100} fromLeft={200}/>
            <EdgeLegendComponent symbolId={argumentEdgeSymbolId} edgeType='argument' edgeText='argument' fromTop={120} fromLeft={200}/>
            <EdgeLegendComponent symbolId={sideEffectOnCallEdge} edgeType='side-effect-on-call' edgeText='side-effect-on-call' fromTop={140} fromLeft={200}/>
            <EdgeLegendComponent symbolId={nonStandardEvaluationEdge} edgeType='non-standard-evaluation' edgeText='non-standard-evaluation' fromTop={160} fromLeft={200}/>
            <div id = 'legend-close-button-div'>
                <button className = {'button-close-legend'} onClick = {slideOutLegend} >X</button>
            </div>
            <style>
                {cssRule}
            </style>
        </div>
    )
}

interface SymbolComponentProps {
    symbolId: string
    edgeType:string
}

const SymbolComponent: React.FC<SymbolComponentProps> = (props) => {
    return(<>
        <use className = {props.edgeType + '-edge-symbol'} key = {'legend-symbol-1' + props.symbolId} href = {`#${props.symbolId}`} x = {20} y = {10}></use>
        <use className = {props.edgeType + '-edge-symbol'} key = {'legend-symbol-2' + props.symbolId} href = {`#${props.symbolId}`} x = {40} y = {10}></use>
        <use className = {props.edgeType + '-edge-symbol'} key = {'legend-symbol-3' + props.symbolId} href = {`#${props.symbolId}`} x = {60} y = {10}></use>
    </>    
    )
}

interface EdgeLegendComponentProps {
    edgeType:string
    symbolId: string
    edgeText:string
    fromTop: number
    fromLeft: number
}

const EdgeLegendComponent: React.FC<EdgeLegendComponentProps> = (props) => {
    const classNameEdge = props.edgeType + '-edge'
    const classNameInteractiveEdge = props.edgeType + '-legend-edge-interactive' 
    
    return(<svg style={{position: 'absolute',top: props.fromTop,  left:props.fromLeft}}>
        <path className={props.edgeType + '-legend-edge' + ' ' + classNameEdge} d='m0 10 l80 0' markerEnd='url(#triangle)' style={{stroke:'black', strokeWidth: 1}}></path>
        <path className = {classNameInteractiveEdge} d='m0 10 l80 0' style={{pointerEvents:'all', strokeWidth: 20}}></path>
        <SymbolComponent edgeType = {props.edgeType} symbolId= {props.symbolId}/>
        <text style = {{pointerEvents: 'all'}} className = {classNameInteractiveEdge + ' ' + classNameEdge} x = {92} y = {15}>{props.edgeText}</text>
    </svg>)
}
