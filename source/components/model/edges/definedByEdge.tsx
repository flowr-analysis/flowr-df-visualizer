import { EdgeProps } from '@xyflow/react'
import { BodyEdgeCompontent } from "./edgeBase"

export function DefinedByEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'black'}}
      label = 'defined-by'
      arrowEnd = {true}
      source={props.source}
      target={props.target}
    />
  }