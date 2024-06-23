import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function ArgumentEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '7,7'}}
      label = 'argument'
  
    />
  }