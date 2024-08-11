import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edge-base'

export function CallsEdge(props:EdgeProps){
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'blue', strokeDasharray: '3,7' }}
		label = 'calls'
		arrowEnd = {true}
		source={props.source}
		target={props.target}
	/>
}
