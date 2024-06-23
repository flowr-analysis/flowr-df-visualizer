import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function RelatesEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '2,3'}}
      label = 'relates'
  
    />
  }