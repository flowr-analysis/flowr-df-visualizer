import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edgeBase'

export function ReturnsEdge(props:EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'blue', strokeDasharray: '4,7' }}
		label = 'returns'
		arrowEnd = {true}
		source={props.source}
		target={props.target}
	/>
}