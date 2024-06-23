import { getStraightPath, BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath} from "reactflow";

const edgeTagMap:{[index: string]:string} = {
  'reads':                   'readsEdge',
  'defined-by':              'definedByEdge',
  'same-read-read':          'sameReadReadEdge', //obsolete?
  'same-def-def':            'sameDefDefEdge', // obsolete?
  'calls':                   'callsEdge',
  'returns':                 'returnsEdge',
  'defines-on-call':         'definesOnCallEdge',
  'defined-by-on-call':      'definedByOnCallEdge',
  'argument':                'argumentEdge',
  'side-effect-on-call':     'sideEffectOnCallEdge',
  'relates':                 'relatesEdge', //obsolete?
  'non-standard-evaluation': 'nonStandardEvaluationEdge'
};

export function edgeTagMapper(edgeTag: string): string {
  return edgeTagMap[edgeTag] ?? '';
}

interface BodyEdgeComponentProps {
  readonly standardEdgeInformation: EdgeProps,
  readonly edgeStyle: React.CSSProperties,
  readonly label: string,
  readonly arrowStart?: boolean;
  readonly arrowEnd?: boolean;
}

export const BodyEdgeCompontent: React.FC<BodyEdgeComponentProps> = (props) => {
  const {sourceX, sourceY, targetX, targetY, id, sourcePosition, targetPosition} = props.standardEdgeInformation
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sourceX ,
    sourceY: sourceY,
    targetX: targetX,
    targetY: targetY,
    targetPosition: targetPosition,
    sourcePosition: sourcePosition
  })
  return (
    <>
    <BaseEdge id={id} path={edgePath} style={props.edgeStyle} markerEnd={props.arrowEnd ? 'url(#triangle)' : undefined} markerStart={props.arrowStart ? 'url(#triangle)' : undefined} />
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