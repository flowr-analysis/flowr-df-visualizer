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
            <div className='variable-definition-node' style={{position: 'absolute',top: 0,  left: 10, display: 'inline-block'}}>variable-definition</div>
            <div className='function-definition-node' style={{position: 'absolute',top: 38,  left: 4, display: 'inline-block'}}>function-definition</div>
            <div className='value-node' style={{position: 'absolute',top: 90,  left: 10, display: 'inline-block'}}>value-node</div>
            <div className='function-call-node' style={{position: 'absolute',top: 130,  left: 10, display: 'inline-block'}}>function-call</div>
            <div className='use-node' style={{position: 'absolute',top: 170,  left: 10, display: 'inline-block'}}>use</div>
            <div className='exit-point-node' style={{position: 'absolute',top: 210,  left: 10, display: 'inline-block'}}>exit-point</div>
            
            <EdgeLegendComponent symbolId={readsEdgeSymbolId} edgeText='reads' fromTop={0} fromLeft={200}/>
            <EdgeLegendComponent symbolId={definedByEdgeSymbolId} edgeText='defined-by' fromTop={20} fromLeft={200}/>
            <EdgeLegendComponent symbolId={callsEdgeSymbolId} edgeText='calls' fromTop={40} fromLeft={200}/>
            <EdgeLegendComponent symbolId={returnsEdgeSymbolId} edgeText='returns' fromTop={60} fromLeft={200}/>
            <EdgeLegendComponent symbolId={definesOnCallEdgeSymbolId} edgeText='defines-on-call' fromTop={80} fromLeft={200}/>
            <EdgeLegendComponent symbolId={definedByOnCallEdgeSymbolId} edgeText='defined-by-on-call' fromTop={100} fromLeft={200}/>
            <EdgeLegendComponent symbolId={argumentEdgeSymbolId} edgeText='argument' fromTop={120} fromLeft={200}/>
            <EdgeLegendComponent symbolId={sideEffectOnCallEdge} edgeText='side-effect-on-call' fromTop={140} fromLeft={200}/>
            <EdgeLegendComponent symbolId={nonStandardEvaluationEdge} edgeText='non-standard-evaluation' fromTop={160} fromLeft={200}/>
            <div id = 'legend-close-button-div'>
                <button className = {'button-close-legend'} onClick = {slideOutLegend} >X</button>
            </div>
        </div>
    )
}

interface SymbolComponentProps {
    symbolId: string
}

const SymbolComponent: React.FC<SymbolComponentProps> = (props) => {
    return(<>
        <use key = {'legend-symbol-1' + props.symbolId} href = {`#${props.symbolId}`} x = {20} y = {10}></use>
        <use key = {'legend-symbol-2' + props.symbolId} href = {`#${props.symbolId}`} x = {40} y = {10}></use>
        <use key = {'legend-symbol-3' + props.symbolId} href = {`#${props.symbolId}`} x = {60} y = {10}></use>
    </>    
    )
}

interface EdgeLegendComponentProps {
    symbolId: string
    edgeText:string
    fromTop: number
    fromLeft: number
}

const EdgeLegendComponent: React.FC<EdgeLegendComponentProps> = (props) => {
    return(<svg style={{position: 'absolute',top: props.fromTop,  left:props.fromLeft}}>
        <path d='m0 10 l80 0' markerEnd='url(#triangle)' style={{stroke:'black', strokeWidth: 1}}></path>
        <SymbolComponent symbolId= {props.symbolId}/>
        <text x = {92} y = {15}>{props.edgeText}</text>
    </svg>)
}

