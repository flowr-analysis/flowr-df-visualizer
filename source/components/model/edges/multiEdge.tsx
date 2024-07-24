import { useCallback } from "react";
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeMouseHandler, EdgeProps, EdgeTypes, InternalNode, ReactFlowState, XYPosition, getBezierPath, useInternalNode, useStore } from '@xyflow/react';
import { getEdgeParams } from "./edgeBase";
import { EdgeType, EdgeTypeName } from "@eagleoutice/flowr/dataflow/graph/edge";

const amountOfSamplePointsForLength = 100
const lengthBetweenMarkerPoints = 10
const startEndDistanceToMarkers = 10
const bezierSplitConst = 1 // 0 <= bezierSplitConst <= 1
export function MultiEdge(props:EdgeProps){
    
  return <BodyMultiEdgeComponent
      standardEdgeInformation={props}
      source={props.source}
      target={props.target}
    />
}

interface BodyMultiEdgeComponentProps {
    readonly standardEdgeInformation: EdgeProps;
    readonly arrowEnd?: boolean;
    readonly source: string;
    readonly target: string;
}

export const BodyMultiEdgeComponent: React.FC<BodyMultiEdgeComponentProps> = (props) => {
  const sourceNode = useInternalNode(props.source)
  const targetNode = useInternalNode(props.target)

  if (!sourceNode || !targetNode) {
    return null;
  }

  const isBiDirectionEdge = useStore((s: ReactFlowState) => {
    const edgeExists = s.edges.some(
      (e) =>
        (e.source === props.standardEdgeInformation.target && e.target === props.standardEdgeInformation.source) ||
        (e.target === props.standardEdgeInformation.source && e.source === props.standardEdgeInformation.target),
    );

    return edgeExists;
  });

  const {  sourceX, sourceY, targetX, targetY, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode, isBiDirectionEdge);

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
  const defaultEdgeStyle: React.CSSProperties = {stroke: 'black', pointerEvents: 'none', cursor: 'none'}
  const arrowEnd = true
  const arrowStart = false

  let label = ''
  for(const singleLabel of (props.standardEdgeInformation.data?.edgeTypes as string[] ?? [])){
      label += singleLabel + ' '
  }
  /*
    <BaseEdge
      id={hoverOverEdgeId} //Interaction Edge
      path={edgePath} 
      style= {{strokeWidth: 10, visibility: 'hidden', pointerEvents: 'all', cursor: 'pointer'}} 
    />
    <BaseEdge
      id={props.standardEdgeInformation.id} //Shown Edge
      path={edgePath} 
      style= {defaultEdgeStyle}
      markerEnd={arrowEnd ? 'url(#triangle)' : undefined} markerStart={arrowStart ? 'url(#triangle)' : undefined} 
    />
  */ 
  const edgeLabelId = props.standardEdgeInformation.id + '-edgeLabel'
  const hoverOverEdgeId = props.standardEdgeInformation.id + '-hoverover-interactive'
  var cssRule = `body:has(#${hoverOverEdgeId}:hover) #${edgeLabelId} {visibility: visible;}`
  
  const givenEdgeTypes = props.standardEdgeInformation.data?.edgeTypes as Set<EdgeTypeName> ?? new Set<EdgeTypeName>()
  return (
    <>
    <BaseEdge
      id={hoverOverEdgeId} //Interaction Edge
      path={edgePath} 
      style= {{strokeWidth: 10, visibility: 'hidden', pointerEvents: 'all', cursor: 'pointer'}} 
    />
    <BaseEdge
      id={props.standardEdgeInformation.id} //Shown Edge
      path={edgePath} 
      style= {defaultEdgeStyle}
      markerEnd={arrowEnd ? 'url(#triangle)' : undefined} markerStart={arrowStart ? 'url(#triangle)' : undefined} 
    />
    <EdgeSymbolComponent id={props.standardEdgeInformation.id} edgeTypes={givenEdgeTypes} edgePath={edgePath}/>
    <style>
      {cssRule}
    </style>
    <EdgeLabelRenderer>
      <div
      id = {edgeLabelId}
      style={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        fontSize: 12,
      }}
      className="nodrag nopan edge-label"
      >
          {label}
      </div>
      
    </EdgeLabelRenderer>
    </>
  );
}

//see also https://en.wikipedia.org/wiki/B%C3%A9zier_curve
/**
 * Calculates Point on BezierCurve 
 * @param t 0 <= t <= 1
 * @param startingPoint 
 * @param startControlPoint 
 * @param endControlPoint 
 * @param endingPoint 
 * @returns Point on BezierCurve equal to the percentage given in t
 */
function bezierCurve(t:number, startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition):XYPosition {
  return ({
    x:
    ((1 - t) * (1 - t) * (1 - t) * startingPoint.x +
    3 * (1 - t) * (1 - t) * t * startControlPoint.x +
    3 * (1 - t) * t * t * endControlPoint.x +
    t * t * t * endingPoint.x),
    y:
    ((1 - t) * (1 - t) * (1 - t) * startingPoint.y +
    3 * (1 - t) * (1 - t) * t * startControlPoint.y +
    3 * (1 - t) * t * t * endControlPoint.y +
    t * t * t * endingPoint.y)
  }
  );
}

function calculateLengthOfBezierCurve(startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition): number{
  const rangeForSamplePoints = range(0,1, amountOfSamplePointsForLength, true)
  const samplePoints = rangeForSamplePoints.map((percentage) => bezierCurve(percentage, startingPoint, startControlPoint, endControlPoint,endingPoint))
  // approximate length with linear interpolation
  const intermediateResult = samplePoints.reduce((prev, curr) => ({point: curr, sum: prev.sum + Math.sqrt(Math.pow(curr.x - prev.point.x, 2) + Math.pow(curr.y - prev.point.y, 2))}),{point: startingPoint, sum:0})
  return intermediateResult.sum
}

function linearPercentageBezierCurve(t:number, startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition):XYPosition{
  const curveLengthTotal = calculateLengthOfBezierCurve(startingPoint, startControlPoint, endControlPoint, endingPoint)
  const rangeForSamplePoints = range(0,1, amountOfSamplePointsForLength, true)
  let approximatedLength = 0
  for(let indexOfPercentageArray = 1; indexOfPercentageArray < rangeForSamplePoints.length; indexOfPercentageArray++){
    const lastPoint = bezierCurve(rangeForSamplePoints[indexOfPercentageArray - 1],startingPoint, startControlPoint, endControlPoint, endingPoint)
    const currentPoint = bezierCurve(rangeForSamplePoints[indexOfPercentageArray],startingPoint, startControlPoint, endControlPoint, endingPoint)
    approximatedLength += Math.sqrt(Math.pow(currentPoint.x - lastPoint.x, 2) + Math.pow(currentPoint.y - lastPoint.y, 2))
    if(approximatedLength / curveLengthTotal >= t){
      return currentPoint
    }
  }
  return endingPoint
}

function range(start: number, end: number, amountOfNumbers:number, includeEnd: boolean): number[]{
  const divideBy = includeEnd ? (amountOfNumbers - 1) : amountOfNumbers
  return Array.from(Array(amountOfNumbers).keys()).map((key) => start + (end - start) / divideBy * key)
}

interface BezierCurve {
  readonly startPoint: XYPosition,
  readonly controlPointStart:XYPosition,
  readonly controlPointEnd:XYPosition,
  readonly endPoint: XYPosition,
}

interface EdgeSymbolComponentProps {
  edgePath: string,
  edgeTypes: Set<EdgeTypeName>
  id: string
}

const edgeTypeNameMap:{[index: string]:string} = {
  'reads':                   'dotSymbol',
  'defined-by':              'hexagonHollowSymbol',
  'calls':                   'starFilledSymbol',
  'returns':                 'circleHollowSymbol',
  'defines-on-call':         'rectangleHollowSymbol',
  'defined-by-on-call':      'rhombusHollowSymbol',
  'argument':                'triangleHollowSymbol',
  'side-effect-on-call':     'crossSymbol',
  'non-standard-evaluation': 'cubeFilledSymbol',
};

export function edgeTypeToSymbolIdMapper(edgeTag: string): string {
  return edgeTypeNameMap[edgeTag] ?? '';
}

/**
 * Creates Evenly spaced Symbols to the corresponding MarkerTypes
 * @param props 
 * @returns list of <use> tags which point to the corresponding symbol
 */
const EdgeSymbolComponent : React.FC<EdgeSymbolComponentProps> = (props) => {
  //Parse 4 Points from the calculated bezier curve
  const pointArray = props.edgePath.replace('M','').replace('C','').split(' ').map((stringPoint)=> stringPoint.split(',').map((stringNumber) => +stringNumber))
  const startPointBez = {x: pointArray[0][0], y:pointArray[0][1]}
  const startControlPointBez = {x: pointArray[1][0], y:pointArray[1][1]}
  const endControlPointBez = {x: pointArray[2][0], y:pointArray[2][1]}
  const endPointBez = {x: pointArray[3][0], y:pointArray[3][1]}

  const lengthOfCurve = calculateLengthOfBezierCurve(startPointBez,startControlPointBez,endControlPointBez,endPointBez)

  //check if curve is too small to fit many points
  let amountOfMarkerPointsInBetween = Math.floor((lengthOfCurve - startEndDistanceToMarkers * 2 - 2 * lengthBetweenMarkerPoints * props.edgeTypes.size) / lengthBetweenMarkerPoints)
  if(amountOfMarkerPointsInBetween <= 0){
    amountOfMarkerPointsInBetween = 0
  }

  const maximumOfInBetweenPoints = 4

  const individualMarkerPointsInBetween = Math.floor(amountOfMarkerPointsInBetween / props.edgeTypes.size) > maximumOfInBetweenPoints ? 
                                          maximumOfInBetweenPoints : 
                                          Math.floor(amountOfMarkerPointsInBetween / props.edgeTypes.size) 

  //calculate which symbols need to be on which points
  const markerMap = new Map<number, string>()
  const pointsMap = new Map<number, XYPosition[]>()
  let indexOfMarkerType = 0
  for(let value of props.edgeTypes){
    markerMap.set(indexOfMarkerType, edgeTypeToSymbolIdMapper(value))

    //evenly space markerPoints
    let percentageArray: number[] = []
    if(individualMarkerPointsInBetween === 0){
      percentageArray = [1 / (1 + props.edgeTypes.size) * (1 + indexOfMarkerType) ]
    } else {
      let nextPoint = (startEndDistanceToMarkers + lengthBetweenMarkerPoints *  indexOfMarkerType)/ lengthOfCurve // first Marker
      while (nextPoint < 1 - (startEndDistanceToMarkers + lengthBetweenMarkerPoints *  props.edgeTypes.size)/ lengthOfCurve){
        percentageArray.push(nextPoint)
        nextPoint += (props.edgeTypes.size) * //Correctly jump for each marker
                      (1 - 2 * (startEndDistanceToMarkers + lengthBetweenMarkerPoints * props.edgeTypes.size) / lengthOfCurve) * // use in between distance as reference 
                      1 / (individualMarkerPointsInBetween * props.edgeTypes.size + 1) //spacing between points
      }
      // last marker
      nextPoint = 1 - (startEndDistanceToMarkers + lengthBetweenMarkerPoints *  (props.edgeTypes.size - (indexOfMarkerType + 1)))/ lengthOfCurve 
      percentageArray.push(nextPoint)
    }
    
    //get points on BezierCurve
    const pointsOnCurve = percentageArray.map((percentage) => linearPercentageBezierCurve(percentage, startPointBez, startControlPointBez, endControlPointBez, endPointBez))
    pointsMap.set(indexOfMarkerType, pointsOnCurve)
    indexOfMarkerType += 1
  }
  
  //create use elements
  let useArray:JSX.Element[] = []
  markerMap.forEach((edgeSymbolId,offsetIndex) => {
    const pointsOfMarker = pointsMap.get(offsetIndex)
    const useBlockArray = pointsOfMarker?.map((point) =>{return (<use key = {props.id + '-' + point.x + '-' + point.y} id = {props.id + '-' + point.x + '-' + point.y} href={`#${edgeSymbolId}`} x={point.x} y={point.y} />)}) ?? []
    useArray = useArray.concat(useBlockArray)
  })
  
  return (
  <>
    <svg width = {'100%'} height = {'100%'} style = {{overflow: 'visible'}}>
      {useArray.map((self) => self)}
    </svg>
  </>)
}


/**
 * calculate the splitted parts of a cubic bezierCurve
 * @param t All values must follow the format 0 < t[i] < 1 && t[i] < t[i + 1]
 * @param startingPoint 
 * @param startControlPoint 
 * @param endControlPoint 
 * @param endingPoint 
 * @returns Array of BezierCurves
 */
function splitBezierCurve(t:number[], startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition):BezierCurve[]{
  
  let currentStartPoint = startingPoint
  let currentStartControlPoint = startControlPoint
  let currentEndControlPoint = endControlPoint
  let currentEndPoint = endingPoint
  
  const returnArray:BezierCurve[] = []
  const percentageDifferenceForDerivative = 0.01 

  for(let percentIndex = 0; percentIndex < t.length; percentIndex++){
    const currentSplitPercent = t[percentIndex]
    const splitBezierCurvePoint = bezierCurve(currentSplitPercent, startingPoint, startControlPoint, endControlPoint, endingPoint)  
    const closeToSplitPoint = bezierCurve(currentSplitPercent + percentageDifferenceForDerivative, startingPoint, startControlPoint, endControlPoint,endingPoint)


    const crossPoint1 = calculateIntersectionPoint(currentStartPoint, currentStartControlPoint, splitBezierCurvePoint, closeToSplitPoint) ?? 
                        {x: currentStartPoint.x + (splitBezierCurvePoint.x - currentStartPoint.x) * 0.5,
                        y: currentStartPoint.y + (splitBezierCurvePoint.y - currentStartPoint.y) * 0.5}
    const newStartControlPointFirstBezierCurve: XYPosition = {x: currentStartPoint.x + (crossPoint1.x - currentStartPoint.x) * bezierSplitConst, y: currentStartPoint.y + (crossPoint1.y - currentStartPoint.y)}
    const newEndControlPointFirstBezierCurve: XYPosition = {x: splitBezierCurvePoint.x - (splitBezierCurvePoint.x - crossPoint1.x) * bezierSplitConst, y: splitBezierCurvePoint.y - (splitBezierCurvePoint.y - crossPoint1.y) * bezierSplitConst}
    const crossPoint2 = calculateIntersectionPoint(splitBezierCurvePoint, closeToSplitPoint, currentEndControlPoint, currentEndPoint)??
                        {x: splitBezierCurvePoint.x + (currentEndPoint.x - splitBezierCurvePoint.x) * 0.5, 
                        y: splitBezierCurvePoint.y + (currentEndPoint.y - splitBezierCurvePoint.y) * 0.5}
    const newStartControlPointSecondBezierCurve: XYPosition = {x: splitBezierCurvePoint.x + (crossPoint2.x - splitBezierCurvePoint.x ) * bezierSplitConst, y: splitBezierCurvePoint.y + (crossPoint2.y - splitBezierCurvePoint.y ) * bezierSplitConst}
    const newEndControlPointSecondBezierCurve: XYPosition = {x: currentEndPoint.x - (currentEndPoint.x - crossPoint2.x) * bezierSplitConst, y: currentEndPoint.y - (currentEndPoint.y - crossPoint2.y) * bezierSplitConst}
    



    const toPush: BezierCurve = {
      startPoint: currentStartPoint,
      controlPointStart: newStartControlPointFirstBezierCurve,
      controlPointEnd: newEndControlPointFirstBezierCurve,
      endPoint: splitBezierCurvePoint
    }
    returnArray.push(toPush)

    currentStartPoint = splitBezierCurvePoint
    currentStartControlPoint = newStartControlPointSecondBezierCurve
    currentEndControlPoint = newEndControlPointSecondBezierCurve
    currentEndPoint = endingPoint
    
  }
  returnArray.push({
    startPoint: currentStartPoint,
    controlPointStart: currentStartControlPoint,
    controlPointEnd: currentEndControlPoint,
    endPoint: currentEndPoint
  })
  return returnArray
}

// from https://paulbourke.net/geometry/pointlineplane/javascript.txt
// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function calculateIntersectionPoint(point1Line1:XYPosition, point2line1:XYPosition, point1line2:XYPosition, point2line2:XYPosition):XYPosition | undefined{

  const {x:x1, y:y1} = point1Line1
  const {x:x2, y:y2} = point2line1
  const {x:x3, y:y3} = point1line2
  const {x:x4, y:y4} = point2line2

  // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    throw Error('lines are of length 0')

	}

	const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
	if (denominator === 0) {
		//throw Error('lines are parallel')
    return undefined
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
	/*
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		throw Error('intersection not along segments')
	}
  */
  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {x, y}
}