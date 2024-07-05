import { useCallback } from "react";
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeMouseHandler, EdgeProps, getBezierPath, useStore } from "reactflow";
import { getEdgeParams } from "./edgeBase";

export function MultiEdge(props:EdgeProps){
    return <BodyMultiEdgeCompontent
      standardEdgeInformation={props}
    />
}

interface BodyMultiEdgeComponentProps {
    readonly standardEdgeInformation: EdgeProps,
  }
  
  export const BodyMultiEdgeCompontent: React.FC<BodyMultiEdgeComponentProps> = (props) => {
    
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(props.standardEdgeInformation.source), [props.standardEdgeInformation.source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(props.standardEdgeInformation.target), [props.standardEdgeInformation.target]));
  
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
    const edgeStyle: React.CSSProperties = {stroke : 'black'}
    const arrowEnd = true
    const arrowStart = false

    let label = ''
    for(const singleLabel of props.standardEdgeInformation.data.edgeTypes){
        label += singleLabel + ' '
    }
    
    return (
      <>
      <BaseEdge
        id={props.standardEdgeInformation.id} 
        path={edgePath} 
        style={edgeStyle} 
        markerEnd={arrowEnd ? 'url(#triangle)' : undefined} markerStart={arrowStart ? 'url(#triangle)' : undefined} 
      />
      <EdgeLabelRenderer>
        <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          fontSize: 12,
          pointerEvents: 'all',
          visibility: props.standardEdgeInformation.data.isHovered ? 'visible' : 'hidden'
        }}
        className="nodrag nopan"
        >
            {label}
        </div>
      </EdgeLabelRenderer>
      </>
    );
  }

function onMouseOver(event: MouseEvent, edge: Edge){

}
