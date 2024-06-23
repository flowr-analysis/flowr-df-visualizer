import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function SideEffectOnCallEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue'}}
      label = 'side-effect-on-call'
  
    />
  }