import { getStraightPath, BaseEdge, EdgeLabelRenderer} from "reactflow";

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

export function BodyEdgeCompontent(props: React.PropsWithoutRef<BodyEdgeComponentProps>){
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
      {props.label}
      </div>
    </EdgeLabelRenderer>
    </>
  );
}