import type { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from './edge-base'


export default function ReadsEdge(props: EdgeProps) {
	return <BodyEdgeComponent
		standardEdgeInformation={props}
		edgeStyle = {{ stroke: 'black', strokeDasharray: '5,5' }}
		label = 'reads'
		arrowEnd = {true}
		source={props.source}
		target={props.target}
	/>
}

