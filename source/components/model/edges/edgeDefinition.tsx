import { getStraightPath, BaseEdge, EdgeLabelRenderer, MarkerType, getMarkerEnd } from "reactflow";


const edgeTagMap:{[index: string]:string} = {
  'reads':               'readsEdge',
  'defined-by':          'definedByEdge',
  'same-read-read':      'sameReadReadEdge',
  'same-def-def':        'sameDefDefEdge',
  'calls':               'callsEdge',
  'returns':             'returnsEdge',
  'defines-on-call':     'definesOnCallEdge',
  'defined-by-on-call':  'definedByOnCallEdge',
  'argument':            'argumentEdge',
  'side-effect-on-call': 'sideEffectOnCallEdge',
  'relates':             'relatesEdge'
};

export function edgeTagMapper(edgeTag: string): string {
  return edgeTagMap[edgeTag] ?? '';
}

interface BodyEdgeComponentProps {
  readonly id: string,
  readonly sourceX: number,
  readonly sourceY: number,
  readonly targetX: number,
  readonly targetY: number,
  readonly edgeStyle: React.CSSProperties,
  readonly label: string,
  readonly arrowStart?: boolean;
  readonly arrowEnd?: boolean;
}

function BodyEdgeCompontent(props: React.PropsWithoutRef<BodyEdgeComponentProps>){
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: props.sourceX ,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  })
  return (
    <>
    <BaseEdge id={props.id} path={edgePath} style={props.edgeStyle} markerEnd={props.arrowEnd ? 'url(#triangle)' : undefined} markerStart={props.arrowStart ? 'url(#triangle)' : undefined} />
    <EdgeLabelRenderer>
      <div
      style={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        fontSize: 12,
        pointerEvents: 'all',
      }}
      className="nodrag nopan"
      >
      {props.id}
      </div>
    </EdgeLabelRenderer>
    </>
  );
}

export default function ReadsEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'black', strokeDasharray: '5,5'}}
    label = 'reads'
    arrowEnd = {true}
  />
}

export function DefinedByEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'black'}}
    label = 'defined-by'
    arrowEnd = {true}
  />
}

export function SameReadReadEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'grey', strokeDasharray: '2,5'}}
    label = 'same-read-read'
  />
}

export function SameDefDefEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '2,7'}}
    label = 'same-def-def'
  />
}

export function CallsEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '3,7'}}
    label = 'calls'

  />
}

export function ReturnsEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '4,7'}}
    label = 'returns'

  />
}

export function DefinesOnCallEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '5,7'}}
    label = 'defines-on-call'

  />
}

export function DefinedByOnCallEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '6,7'}}
    label = 'defined-by-on-call'

  />
}

export function ArgumentEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '7,7'}}
    label = 'argument'

  />
}

export function SideEffectOnCallEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue'}}
    label = 'side-effect-on-call'

  />
}

export function RelatesEdge({ id, sourceX, sourceY, targetX, targetY} : {
  id: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
  }) {
  return <BodyEdgeCompontent
    id = {id}
    sourceX = {sourceX}
    sourceY = {sourceY}
    targetX = {targetX}
    targetY = {targetY}
    edgeStyle = {{stroke: 'blue', strokeDasharray: '2,3'}}
    label = 'relates'

  />
}