import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function DefinedByOnCallEdge(props: EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '6,7'}}
      label = 'defined-by-on-call'
      arrowEnd = {true}
    />
  }