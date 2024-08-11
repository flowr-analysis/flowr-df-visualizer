import type { EdgeProps, ReactFlowState, XYPosition } from '@xyflow/react'
import { EdgeLabelRenderer, getBezierPath, useInternalNode, useStore } from '@xyflow/react'
import { getEdgeParams } from './edge-base'
import type { EdgeTypeName } from '@eagleoutice/flowr/dataflow/graph/edge'
import { VisualStateModel } from '../visual-state-model'

const amountOfSamplePointsForLength = 100
const lengthBetweenMarkerPoints = 10
const startEndDistanceToMarkers = 10

export function MultiEdge(props:EdgeProps){

	return <BodyMultiEdgeComponent
		standardEdgeInformation={props}
		source={props.source}
		target={props.target}
	/>
}

interface BodyMultiEdgeComponentProps {
    readonly standardEdgeInformation: EdgeProps;
    readonly arrowEnd?:               boolean;
    readonly source:                  string;
    readonly target:                  string;
}

export const BodyMultiEdgeComponent: React.FC<BodyMultiEdgeComponentProps> = ({ standardEdgeInformation, source, target }) => {
	const sourceNode = useInternalNode(source)
	const targetNode = useInternalNode(target)

	if(!sourceNode || !targetNode) {
		return null
	}

	const isBiDirectionEdge = useStore((s: ReactFlowState) => {
		const edgeExists = s.edges.some(
			e =>
				(e.source === standardEdgeInformation.target && e.target === standardEdgeInformation.source) ||
        (e.target === standardEdgeInformation.source && e.source === standardEdgeInformation.target),
		)

		return edgeExists
	})

	const {  sourceX, sourceY, targetX, targetY, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode, isBiDirectionEdge)

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX:        sourceX,
		sourceY:        sourceY,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX:        targetX,
		targetY:        targetY,
	})

	let label = ''
	for(const singleLabel of (standardEdgeInformation.data?.edgeTypes as string[] ?? [])){
		label += singleLabel + ' '
	}

	const edgeLabelId = standardEdgeInformation.id + '-edgeLabel'
	const hoverOverEdgeId = standardEdgeInformation.id + '-hoverover-interactive'
	const cssRule = `body:has(#${hoverOverEdgeId}:hover) #${edgeLabelId} {visibility: visible;}`

	const givenEdgeTypes = standardEdgeInformation.data?.edgeTypes as Set<EdgeTypeName> ?? new Set<EdgeTypeName>()

	return (
		<>
			<PathWithMarkerComponent id={standardEdgeInformation.id} edgeTypes={givenEdgeTypes} edgePath={edgePath} visualStateModel={standardEdgeInformation.data?.visualStateModel as VisualStateModel ?? new VisualStateModel()}/>
			<style>
				{cssRule}
			</style>
			<EdgeLabelRenderer>
				<div
					id = {edgeLabelId}
					style={{
						position:  'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						fontSize:  12,
					}}
					className="nodrag nopan edge-label"
				>
					{label}
				</div>

			</EdgeLabelRenderer>
		</>
	)
}

//see also https://en.wikipedia.org/wiki/B%C3%A9zier_curve
/**
 * Calculates Point on BezierCurve. `t - 0 <= t <= 1`
 * @returns Point on BezierCurve
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
	)
}

function calculateLengthOfBezierCurve(startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition): number{
	const rangeForSamplePoints = range(0,1, amountOfSamplePointsForLength, true)
	const samplePoints = rangeForSamplePoints.map((percentage) => bezierCurve(percentage, startingPoint, startControlPoint, endControlPoint,endingPoint))
	// approximate length with linear interpolation
	const intermediateResult = samplePoints.reduce((prev, curr) => ({ point: curr, sum: prev.sum + Math.sqrt(Math.pow(curr.x - prev.point.x, 2) + Math.pow(curr.y - prev.point.y, 2)) }),{ point: startingPoint, sum: 0 })
	return intermediateResult.sum
}

/**
 * calculates the percentage wise (in relation to length) point on bezier-curve.
 * `t` must be in the range of `0 <= t <= 1`
 * @returns point which is approximately t percent through the bezier-curve
 */
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
  readonly startPoint:        XYPosition,
  readonly controlPointStart: XYPosition,
  readonly controlPointEnd:   XYPosition,
  readonly endPoint:          XYPosition,
}

interface PathWithMarkerComponentProps {
  edgePath:         string,
  edgeTypes:        Set<EdgeTypeName>
  id:               string
  visualStateModel: VisualStateModel
}

const edgeTypeNameMap:{[index: string]: string} = {
	'reads':                   'dotSymbol',
	'defined-by':              'hexagonHollowSymbol',
	'calls':                   'starFilledSymbol',
	'returns':                 'circleHollowSymbol',
	'defines-on-call':         'rectangleHollowSymbol',
	'defined-by-on-call':      'rhombusHollowSymbol',
	'argument':                'triangleHollowSymbol',
	'side-effect-on-call':     'crossSymbol',
	'non-standard-evaluation': 'cubeFilledSymbol',
}

export function edgeTypeToSymbolIdMapper(edgeTag: string): string {
	return edgeTypeNameMap[edgeTag] ?? ''
}

const edgeTypeNameMarkerMap:{[index: string]: string} = {
	'reads':                   'dotMarker',
	'defined-by':              'hexagonHollowMarker',
	'calls':                   'starFilledMarker',
	'returns':                 'circleHollowMarker',
	'defines-on-call':         'rectangleHollowMarker',
	'defined-by-on-call':      'rhombusHollowMarker',
	'argument':                'triangleHollowMarker',
	'side-effect-on-call':     'crossMarker',
	'non-standard-evaluation': 'cubeFilledMarker',
}

export function edgeTypeToMarkerIdMapper(edgeTag: string): string {
	return edgeTypeNameMarkerMap[edgeTag] ?? ''
}

/**
 * split a cubic bezier-curve into two parts using de Casteljaus Algorithm.
 * `t` must be in the range of `0 < t < 1`
 * @returns Array of two elements where the first is the first part of the split curve and second is last part of the split curve
 */
function splitSingleBezierCurve(t:number, startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition):BezierCurve[] {
	const pointArray: XYPosition[][] = [[],[],[],[]]
	pointArray[0].push(startingPoint)
	pointArray[0].push(startControlPoint)
	pointArray[0].push(endControlPoint)
	pointArray[0].push(endingPoint)

	for(let algorithmIndex = 1; algorithmIndex <= 3; algorithmIndex++){
		for(let pointIndex = 0; pointIndex <= 3 - algorithmIndex; pointIndex++){
			const calcX = pointArray[algorithmIndex - 1][pointIndex].x * (1 - t) + pointArray[algorithmIndex - 1][pointIndex + 1].x * t
			const calcY = pointArray[algorithmIndex - 1][pointIndex].y * (1 - t) + pointArray[algorithmIndex - 1][pointIndex + 1].y * t
			pointArray[algorithmIndex].push({ x: calcX, y: calcY })
		}
	}
	return ([
		{ startPoint: pointArray[0][0],controlPointStart: pointArray[1][0], controlPointEnd: pointArray[2][0], endPoint: pointArray[3][0] },
		{ startPoint: pointArray[3][0],controlPointStart: pointArray[2][1], controlPointEnd: pointArray[1][2], endPoint: pointArray[0][3] }
	])

}

/**
 * Calculate the split parts of a cubic bezierCurve.
 * All values from `t` must follow the format `0 < t[i] < 1 && t[i] < t[i + 1]`
 * @returns Array of BezierCurves
 */
function splitBezierCurve(t:number[], startingPoint:XYPosition, startControlPoint:XYPosition, endControlPoint: XYPosition, endingPoint:XYPosition):BezierCurve[]{

	let A = startingPoint
	let B = startControlPoint
	let C = endControlPoint
	let D = endingPoint

	const returnArray:BezierCurve[] = []


	//Calculate linear percentages of curves.
	const linearPercentagePoints: number[] = []
	const curveLengthTotal = calculateLengthOfBezierCurve(startingPoint, startControlPoint, endControlPoint, endingPoint)
	const rangeForSamplePoints = range(0,1, amountOfSamplePointsForLength, true)
	let approximatedLength = 0
	let indexOfTArray = 0
	for(let indexOfPercentageArray = 1; indexOfPercentageArray < rangeForSamplePoints.length; indexOfPercentageArray++){
		const lastPoint = bezierCurve(rangeForSamplePoints[indexOfPercentageArray - 1],startingPoint, startControlPoint, endControlPoint, endingPoint)
		const currentPoint = bezierCurve(rangeForSamplePoints[indexOfPercentageArray],startingPoint, startControlPoint, endControlPoint, endingPoint)
		approximatedLength += Math.sqrt(Math.pow(currentPoint.x - lastPoint.x, 2) + Math.pow(currentPoint.y - lastPoint.y, 2))
		if(approximatedLength / curveLengthTotal >= t[indexOfTArray]){
			linearPercentagePoints.push(rangeForSamplePoints[indexOfPercentageArray])
			indexOfTArray++
			if(indexOfTArray >= t.length){
				break
			}
		}
	}

	let lastBezierCurve:BezierCurve = { startPoint: { x: 0, y: 0 }, controlPointStart: { x: 0, y: 0 }, controlPointEnd: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } }
	let startPercentage: number = 0
	for(let percentIndex = 0; percentIndex < linearPercentagePoints.length; percentIndex++){
		const currentT = (linearPercentagePoints[percentIndex] - startPercentage) / (1 - startPercentage)

		const newCurves = splitSingleBezierCurve(currentT, A, B, C, D)
		lastBezierCurve = newCurves[1]

		returnArray.push({
			startPoint:        newCurves[0].startPoint,
			controlPointStart: newCurves[0].controlPointStart,
			controlPointEnd:   newCurves[0].controlPointEnd,
			endPoint:          newCurves[0].endPoint })

		startPercentage = linearPercentagePoints[percentIndex]
		A = newCurves[1].startPoint
		B = newCurves[1].controlPointStart
		C = newCurves[1].controlPointEnd
		D = newCurves[1].endPoint
	}

	returnArray.push({
		startPoint:        lastBezierCurve.startPoint,
		controlPointStart: lastBezierCurve.controlPointStart,
		controlPointEnd:   lastBezierCurve.controlPointEnd,
		endPoint:          lastBezierCurve.endPoint })
	return returnArray
}

/** */
const PathWithMarkerComponent : React.FC<PathWithMarkerComponentProps> = ({ edgePath, edgeTypes, id, visualStateModel }) => {
	//Parse 4 Points from the calculated bezier-curve
	const pointArray = edgePath.replace('M','').replace('C','').split(' ').map((stringPoint)=> stringPoint.split(',').map((stringNumber) => +stringNumber))
	const startPointBez = { x: pointArray[0][0], y: pointArray[0][1] }
	const startControlPointBez = { x: pointArray[1][0], y: pointArray[1][1] }
	const endControlPointBez = { x: pointArray[2][0], y: pointArray[2][1] }
	const endPointBez = { x: pointArray[3][0], y: pointArray[3][1] }

	const lengthOfCurve = calculateLengthOfBezierCurve(startPointBez,startControlPointBez,endControlPointBez,endPointBez)

	//check if the curve is too small to fit many points
	let amountOfMarkerPointsInBetween = Math.floor((lengthOfCurve - startEndDistanceToMarkers * 2 - 2 * lengthBetweenMarkerPoints * edgeTypes.size) / lengthBetweenMarkerPoints)
	if(amountOfMarkerPointsInBetween <= 0){
		amountOfMarkerPointsInBetween = 0
	}

	const maximumOfInBetweenPoints = 4

	const individualMarkerPointsInBetween = Math.floor(amountOfMarkerPointsInBetween / edgeTypes.size) > maximumOfInBetweenPoints ?
		maximumOfInBetweenPoints :
		Math.floor(amountOfMarkerPointsInBetween / edgeTypes.size)

	//calculate which symbols need to be on which points
	//index -> edgeType
	const markerMap = new Map<number, string>()
	//index -> positionArray
	const pointsMap = new Map<number, XYPosition[]>()
	//index -> bezierCurveArray
	const curveMap = new Map<number, BezierCurve[]>()


	let indexOfMarkerType = 0
	for(const value of edgeTypes){
		markerMap.set(indexOfMarkerType, value)

		//evenly space markerPoints
		let percentageArray: number[] = []
		if(individualMarkerPointsInBetween === 0){
			percentageArray = [1 / (1 + edgeTypes.size) * (1 + indexOfMarkerType) ]
		} else {
			let nextPoint = (startEndDistanceToMarkers + lengthBetweenMarkerPoints *  indexOfMarkerType)/ lengthOfCurve // first Marker
			while(nextPoint < 1 - (startEndDistanceToMarkers + lengthBetweenMarkerPoints *  edgeTypes.size)/ lengthOfCurve){
				percentageArray.push(nextPoint)
				nextPoint += (edgeTypes.size) * //Correctly jump for each marker
                      (1 - 2 * (startEndDistanceToMarkers + lengthBetweenMarkerPoints * edgeTypes.size) / lengthOfCurve) * // use in between distance as reference
                      1 / (individualMarkerPointsInBetween * edgeTypes.size + 1) //spacing between points
			}
			// last marker
			nextPoint = 1 - (startEndDistanceToMarkers + lengthBetweenMarkerPoints *  (edgeTypes.size - (indexOfMarkerType + 1)))/ lengthOfCurve
			percentageArray.push(nextPoint)
		}

		//get points on BezierCurve
		const pointsOnCurve = percentageArray.map((percentage) => linearPercentageBezierCurve(percentage, startPointBez, startControlPointBez, endControlPointBez, endPointBez))
		pointsMap.set(indexOfMarkerType, pointsOnCurve)
		curveMap.set(indexOfMarkerType, splitBezierCurve(percentageArray, startPointBez, startControlPointBez, endControlPointBez, endPointBez))
		indexOfMarkerType += 1
	}

	//create use elements
	let useArray:JSX.Element[] = []
	markerMap.forEach((edgeType,offsetIndex) => {
		const pointsOfMarker = pointsMap.get(offsetIndex)
		const useBlockArray = pointsOfMarker?.map((point) =>{
			return (<use className = {`${edgeType}-edge-symbol`}key = {id + '-' + point.x + '-' + point.y} id = {id + '-' + point.x + '-' + point.y} href={`#${edgeTypeToSymbolIdMapper(edgeType)}`} x={point.x} y={point.y} />)
		}) ?? []
		useArray = useArray.concat(useBlockArray)
	})

	//create curve
	const markerEdgeMap: JSX.Element[] = []

	curveMap.forEach((array, index) =>{
		const firstBezierCurve = array[0]
		let dOfPath = `M${firstBezierCurve.startPoint.x},${firstBezierCurve.startPoint.y} `
		array.forEach((curve) => {
			dOfPath += `C${curve.controlPointStart.x},${curve.controlPointStart.y} ${curve.controlPointEnd.x},${curve.controlPointEnd.y} ${curve.endPoint.x},${curve.endPoint.y} `
		})

		const edgeType = markerMap.get(index) ?? ''
		dOfPath = dOfPath.trimEnd()
		const pathId = id + `-${edgeType}-marker-edge`
		const markerEdge = (
			<path
				key = {pathId}
				id = {pathId}
				className={'react-flow__edge-path multi-edge' + ` ${edgeType}-edge` + ((visualStateModel.isGreyedOutMap.get(edgeType) ?? false) ? ' legend-passive': '')}
				d={dOfPath}
				markerMid = {`url(#${edgeTypeToMarkerIdMapper(edgeType)})`}
				markerEnd = {'url(#triangle)'}
			/>
		)
		markerEdgeMap.push(markerEdge)
	})
	const hoverOverEdgeId = id + '-hoverover-interactive'
	return (
		<>
			<path
				id={hoverOverEdgeId} //Interaction Edge
				d={edgePath}
				className = 'interactive-edge'
			/>
			{markerEdgeMap.map((self) => self)}
		</>)
}
