import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function SameReadReadEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'grey', strokeDasharray: '2,5'}}
      label = 'same-read-read'
    />
  }