import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edge-base'

export function SideEffectOnCallEdge(props:EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'blue' }}
		label = 'side-effect-on-call'
		source={props.source}
		target={props.target}
	/>
}
