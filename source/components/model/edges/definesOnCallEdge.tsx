import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function DefinesOnCallEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '5,7'}}
      label = 'defines-on-call'
      arrowEnd = {true}
    />
  }