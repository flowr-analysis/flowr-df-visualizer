import { EdgeProps } from '@xyflow/react'
import { BodyEdgeCompontent } from "./edgeBase"

export function SameReadReadEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'grey', strokeDasharray: '2,5'}}
      label = 'same-read-read'
      source={props.source}
      target={props.target}
    />
  }