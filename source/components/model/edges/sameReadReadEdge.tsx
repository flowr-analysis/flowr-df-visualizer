import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edgeBase'

export function SameReadReadEdge(props:EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'grey', strokeDasharray: '2,5' }}
		label = 'same-read-read'
		source={props.source}
		target={props.target}
	/>
}