import { BodyEdgeCompontent } from "./edgeBase"

export function NonStandardEvaluationEdge({ id, sourceX, sourceY, targetX, targetY} : {
    id: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
    }) {
    return <BodyEdgeCompontent
      id = {id}
      sourceX = {sourceX}
      sourceY = {sourceY}
      targetX = {targetX}
      targetY = {targetY}
      edgeStyle = {{stroke: 'blue', strokeDasharray: '2,3'}}
      label = 'Non Standard Evaluation'
  
    />
  }