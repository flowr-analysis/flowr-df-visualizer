import { EdgeProps } from '@xyflow/react'
import { BodyEdgeComponent } from "./edgeBase"

export function DefinedByEdge(props:EdgeProps) {
    return <BodyEdgeComponent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'black'}}
      label = 'defined-by'
      arrowEnd = {true}
      source={props.source}
      target={props.target}
    />
  }