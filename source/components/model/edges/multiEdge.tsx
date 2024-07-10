import { useCallback } from "react";
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeMouseHandler, EdgeProps, getBezierPath, useInternalNode, useStore } from '@xyflow/react';
import { getEdgeParams } from "./edgeBase";

export function MultiEdge(props:EdgeProps){
    return <BodyMultiEdgeCompontent
      standardEdgeInformation={props}
      source={props.source}
      target={props.target}
    />
}

interface BodyMultiEdgeComponentProps {
    readonly standardEdgeInformation: EdgeProps;
    readonly arrowEnd?: boolean;
    readonly source: string;
    readonly target: string;
  }
  
  export const BodyMultiEdgeCompontent: React.FC<BodyMultiEdgeComponentProps> = (props) => {
  
    const sourceNode = useInternalNode(props.source)
    const targetNode = useInternalNode(props.target)
    if (!sourceNode || !targetNode) {
      return null;
    }
    
    const {  sourceX, sourceY, targetX, targetY, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
    
    const [edgePath, labelX, labelY, offsetX, offsetY] = getBezierPath({
      sourceX: sourceX,
      sourceY: sourceY,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      targetX: targetX,
      targetY: targetY,
    });
    
    //const labelPositionX = targetX - sourceX > 0 ? labelX + offsetX / 2 : labelX - offsetX / 2 
    //const labelPositionY = targetY - sourceY > 0 ? labelY + offsetY / 2 : labelY - offsetY / 2
    const defaultEdgeStyle: React.CSSProperties = {stroke : 'black', pointerEvents: 'none', cursor: 'none'}
    const arrowEnd = true
    const arrowStart = false

    let label = ''
    for(const singleLabel of (props.standardEdgeInformation.data?.edgeTypes as string[] ?? [])){
        label += singleLabel + ' '
    }

    const edgeLabelId = props.standardEdgeInformation.id + '-edgeLabel'
    const hoverOverEdgeId = props.standardEdgeInformation.id + '-hoverover-interactive'
    var cssRule = 
    `body:has(#${hoverOverEdgeId}:hover) #${edgeLabelId} {visibility: visible;}`
    
    return (
      <>
      <BaseEdge
        id={hoverOverEdgeId} //Interaction Edge
        path={edgePath} 
        style= {{strokeWidth: 10, visibility: 'hidden', pointerEvents: 'all', cursor: 'pointer'}} 
      />
      <BaseEdge
        id={props.standardEdgeInformation.id} //Shown Edge
        path={edgePath} 
        style= {defaultEdgeStyle}
        markerEnd={arrowEnd ? 'url(#triangle)' : undefined} markerStart={arrowStart ? 'url(#triangle)' : undefined} 
      />
      <style>
        {cssRule}
      </style>
      <EdgeLabelRenderer>
        <div
        id = {edgeLabelId}
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          fontSize: 12,
        }}
        className="nodrag nopan edge-label"
        >
            {label}
        </div>
        
      </EdgeLabelRenderer>
      </>
    );
  }

