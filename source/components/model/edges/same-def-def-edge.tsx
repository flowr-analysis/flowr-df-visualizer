import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edge-base'

export function SameDefDefEdge(props:EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'blue', strokeDasharray: '2,7' }}
		label = 'same-def-def'
		source={props.source}
		target={props.target}
	/>
}
