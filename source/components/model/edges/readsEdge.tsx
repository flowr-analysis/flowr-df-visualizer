import { BaseEdge, BezierEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getStraightPath } from "reactflow"
import { BodyEdgeCompontent } from "./edgeBase"

export default function ReadsEdge(props: EdgeProps) {
    return <BodyEdgeCompontent
      standardEdgeInformation={props}
      edgeStyle = {{stroke: 'black', strokeDasharray: '5,5'}}
      label = 'reads'
      arrowEnd = {true}
    />
  }

 