import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edge-base'

export function NonStandardEvaluationEdge(props:EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'blue', strokeDasharray: '2,3' }}
		label = 'Non Standard Evaluation'
		source={props.source}
		target={props.target}
	/>
}
