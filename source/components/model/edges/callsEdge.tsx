import { EdgeProps } from '@xyflow/react'
import { BodyEdgeCompontent } from "./edgeBase"

export function CallsEdge(props:EdgeProps){
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '3,7'}}
      label = 'calls'
      arrowEnd = {true}
      source={props.source}
      target={props.target}
    />
  }