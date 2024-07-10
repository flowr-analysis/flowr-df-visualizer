import { useCallback } from "react";
import { getStraightPath, BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, Node, Position, useStore, XYPosition, useInternalNode} from '@xyflow/react';

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
  'non-standard-evaluation': 'nonStandardEvaluationEdge',
  'multiEdge':               'multiEdge'
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
  readonly source: string;
  readonly target: string;
}

export const BodyEdgeCompontent: React.FC<BodyEdgeComponentProps> = (props) => {
  
  const sourceNode = useInternalNode(props.source)
  const targetNode = useInternalNode(props.target)
    
  if (!sourceNode || !targetNode) {
    return null;
  }
  
  const {  sourceX, sourceY, targetX, targetY, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY, offsetX, offsetY] = getBezierPath({
    sourceX: sourceX,
    sourceY: sourceY,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: targetX,
    targetY: targetY,
  });
  
  //const labelPositionX = targetX - sourceX > 0 ? labelX + offsetX / 2 : labelX - offsetX / 2 
  //const labelPositionY = targetY - sourceY > 0 ? labelY + offsetY / 2 : labelY - offsetY / 2
  return (
    <>
    <BaseEdge
      id={props.standardEdgeInformation.id} 
      path={edgePath} 
      style={props.edgeStyle} 
      markerEnd={props.arrowEnd ? 'url(#triangle)' : undefined} markerStart={props.arrowStart ? 'url(#triangle)' : undefined} 
    />
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
        {props.standardEdgeInformation.label}
      </div>
    </EdgeLabelRenderer>
    </>
  );
}


// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode:Node, targetNode:Node):XYPosition {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    position: intersectionNodePosition,
  } = intersectionNode;

  const targetPosition = targetNode.position;

  const w = intersectionNodeWidth! / 2;
  const h = intersectionNodeHeight! / 2;

  const x2 = intersectionNodePosition!.x + w;
  const y2 = intersectionNodePosition!.y + h;
  const x1 = targetPosition!.x! + targetNode.width! / 2;
  const y1 = targetPosition!.y! + targetNode.height! / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: Node, intersectionPoint:XYPosition): Position {
  
  const nodeToLookAt = { ...node.position, ...node };
  const nx = Math.round(nodeToLookAt.x!);
  const ny = Math.round(nodeToLookAt.y!);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  const leftPosition = node.position!.x 
  const rightPosition = node.position!.x + node.width!
  const topPosition = node.position!.y
  const buttomPosition = node.position!.y + node.height!
  
  if(Math.abs(leftPosition - intersectionPoint.x) <= 0.1){
    return Position.Left
  }

  if(Math.abs(rightPosition - intersectionPoint.x) <= 0.1){
    return Position.Right
  }

  if(Math.abs(topPosition - intersectionPoint.y) <= 0.1){
    return Position.Top
  }

  if(Math.abs(buttomPosition - intersectionPoint.y) <= 0.1){
    return Position.Bottom
  }

  return Position.Top
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source:Node, target: Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sourceX: sourceIntersectionPoint.x,
    sourceY: sourceIntersectionPoint.y,
    targetX: targetIntersectionPoint.x,
    targetY: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
