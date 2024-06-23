import { EdgeProps } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export function NonStandardEvaluationEdge(props:EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '2,3'}}
      label = 'Non Standard Evaluation'
  
    />
  }