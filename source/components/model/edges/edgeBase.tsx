import { useCallback } from "react";
import { getStraightPath, BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, Node, Position, useStore, XYPosition, useInternalNode, InternalNode} from '@xyflow/react';

const edgeTagMap:{[index: string]:string} = {
  'reads':                   'readsEdge',
  'defined-by':              'definedByEdge',
  'calls':                   'callsEdge',
  'returns':                 'returnsEdge',
  'defines-on-call':         'definesOnCallEdge',
  'defined-by-on-call':      'definedByOnCallEdge',
  'argument':                'argumentEdge',
  'side-effect-on-call':     'sideEffectOnCallEdge',
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

export const BodyEdgeComponent: React.FC<BodyEdgeComponentProps> = (props) => {


  const sourceNode = useInternalNode(props.source)
  const targetNode = useInternalNode(props.target)
    
  if (!sourceNode || !targetNode) {
    return null;
  }
  
  const {  sourceX, sourceY, targetX, targetY, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode,false);


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
  


  const intersectionNodeWidth = intersectionNode.measured?.width
  const intersectionNodeHeight = intersectionNode.measured?.height

  const targetNodeWidth = targetNode.measured?.width
  const targetNodeHeight = targetNode.measured?.height
  
  if(intersectionNodeHeight === undefined || intersectionNodeWidth === undefined || targetNodeWidth === undefined || targetNodeHeight === undefined){
    throw Error('width or height not measured')
  }
  /*
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    position: intersectionNodePosition,
  } = intersectionNode;
  */
  const targetPosition = getAbsolutePosition(targetNode);
  const intersectionNodePosition = getAbsolutePosition(intersectionNode)

  //Set position correctly because subnode position is relative to parent
  
  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNodeWidth / 2;
  const y1 = targetPosition.y + targetNodeHeight / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

function getNodeIntersectionForTargetPosition(intersectionNode:Node, targetPosition:XYPosition):XYPosition {



  const intersectionNodeWidth = intersectionNode.measured?.width
  const intersectionNodeHeight = intersectionNode.measured?.height

  
  if(intersectionNodeHeight === undefined || intersectionNodeWidth === undefined){
    throw Error('width or height not measured')
  }
  
  const intersectionNodePosition = getAbsolutePosition(intersectionNode)

  //Set position correctly because subnode position is relative to parent
  
  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x 
  const y1 = targetPosition.y 

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
  

  if(node.position.x === undefined || node.position.y === undefined || node.measured?.height === undefined || node.measured.width === undefined){
    throw Error('position or measured dimension undefined')
  }

  const absolutePositionNode = getAbsolutePosition(node)

  const leftPosition = absolutePositionNode.x 
  const rightPosition = absolutePositionNode.x + node.measured.width
  const topPosition = absolutePositionNode.y
  const bottomPosition = absolutePositionNode.y + node.measured.height
  
  if(Math.abs(leftPosition - intersectionPoint.x) <= 0.1){
    return Position.Left
  }

  if(Math.abs(rightPosition - intersectionPoint.x) <= 0.1){
    return Position.Right
  }

  if(Math.abs(topPosition - intersectionPoint.y) <= 0.1){
    return Position.Top
  }

  if(Math.abs(bottomPosition - intersectionPoint.y) <= 0.1){
    return Position.Bottom
  }

  return Position.Top
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source:Node, target: Node, isBidirectionalEdge:boolean) {
  let sourceIntersectionPoint = getNodeIntersection(source, target);
  let targetIntersectionPoint = getNodeIntersection(target, source);


  const degreeOfRotation = 20
  if(isBidirectionalEdge){
    sourceIntersectionPoint = rotatePositionOnNodeDegrees(source, sourceIntersectionPoint, degreeOfRotation)
    targetIntersectionPoint = rotatePositionOnNodeDegrees(target, targetIntersectionPoint, -degreeOfRotation)
  }

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


function getAbsolutePosition(currentNode:Node):XYPosition{
  const internalNode= useInternalNode(currentNode.id)
  return internalNode?.internals.positionAbsolute ?? currentNode.position
}

function rotatePositionOnNodeDegrees(node:Node, intersectionPoint:XYPosition, angleInDegrees: number):XYPosition{
  if(node.position.x === undefined || node.position.y === undefined || node.measured?.height === undefined || node.measured.width === undefined){
    throw Error('position or measured dimension undefined')
  }
  const nodeMiddle:XYPosition = {x: node.position.x + 1/2 * node.measured.width, y:node.position.y + 1/2 * node.measured.height}
  
  const distanceToMiddle:XYPosition = {x: intersectionPoint.x - nodeMiddle.x, y: intersectionPoint.y - nodeMiddle.y}
  let degreeFromMiddle  = 0
  if(distanceToMiddle.x === 0){
    degreeFromMiddle = distanceToMiddle.y >= 0 ?  Math.PI / 2 : Math.PI * 3/2 
  } else {
    degreeFromMiddle = Math.atan2(distanceToMiddle.y , distanceToMiddle.x)
  }
  
  const newAngle = degreeFromMiddle + angleInDegrees / 360 * 2 * Math.PI
  const lengthLongerFromMiddleOfNode = node.measured.height + node.measured.width
  const newReferencePoint:XYPosition = {x: Math.cos(newAngle) * lengthLongerFromMiddleOfNode + nodeMiddle.x, y: Math.sin(newAngle) * lengthLongerFromMiddleOfNode + nodeMiddle.y} 
  return getNodeIntersectionForTargetPosition(node, newReferencePoint)
}