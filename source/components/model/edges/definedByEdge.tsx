import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function DefinedByEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'black'}}
      label = 'defined-by'
      arrowEnd = {true}
    />
  }