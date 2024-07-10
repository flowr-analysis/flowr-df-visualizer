import { EdgeProps } from '@xyflow/react'
import { BodyEdgeCompontent } from "./edgeBase"

export function ReturnsEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '4,7'}}
      label = 'returns'
      arrowEnd = {true}
      source={props.source}
      target={props.target}
    />
  }