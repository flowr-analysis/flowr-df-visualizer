import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edge-base'

export function ArgumentEdge(props:EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'blue', strokeDasharray: '7,7' }}
		label = 'argument'
		source={props.source}
		target={props.target}
	/>
}
