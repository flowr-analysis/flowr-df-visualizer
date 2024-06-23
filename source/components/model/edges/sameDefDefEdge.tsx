import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function SameDefDefEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '2,7'}}
      label = 'same-def-def'
    />
  }