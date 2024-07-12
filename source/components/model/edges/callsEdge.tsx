import { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from "./edgeBase"

export function CallsEdge(props:EdgeProps){
    return <BodyEdgeComponent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '3,7'}}
      label = 'calls'
      arrowEnd = {true}
      source={props.source}
      target={props.target}
    />
  }