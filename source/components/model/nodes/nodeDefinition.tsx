import { ConnectionLineComponentProps, Node, NodeProps , NodeResizer, Position} from '@xyflow/react'
import { HandleNodeComponent } from "./handleNodeComponent"
import React from "react";
import { ProgressPlugin } from "webpack";

import { getBezierPath } from '@xyflow/react';
import { getEdgeParams } from "../edges/edgeBase";


function FloatingConnectionLine(props:ConnectionLineComponentProps) {
  const { toX, toY, fromPosition, toPosition, fromNode} = props
  
  if (!fromNode) {
    return null;
  }

  const targetNode: Node = {
    id: 'connection-target',
    width: 1,
    height: 1,
    position: {x: toX, y: toY},
    data:{}
  };

  const { sourceX, sourceY } = getEdgeParams(fromNode, targetNode);
  const [edgePath] = getBezierPath({
    sourceX: sourceX,
    sourceY: sourceY,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    targetX: toX,
    targetY: toY
  });

  return (
      <g>
        <path
            fill="none"
            stroke="#222"
            strokeWidth={1.5}
            className="animated"
            d={edgePath}
        />
        <circle
            cx={toX}
            cy={toY}
            fill="#fff"
            r={3}
            stroke="#222"
            strokeWidth={1.5}
        />
      </g>
  );
}

export default FloatingConnectionLine;




interface BodyNodeComponentProps{
  readonly className: string
  readonly data: NodeProps['data']
}

interface NodeComponentProps {
  readonly data: NodeProps['data']
}

const BodyNodeComponent: React.FC<BodyNodeComponentProps> = (props) => {
  return (
    <HandleNodeComponent>
      <div className = {props.className}>
        <HoverOverComponent name={props.data.label as string} id={props.data.id as string} nodeType= {props.data.nodeType as string}/>
        <label htmlFor="text">{props.data.label as string}</label>
      </div>
    </HandleNodeComponent>
  )
}

interface HoverOverComponentProps{
  readonly name: string,
  readonly id: string,
  readonly nodeType: string
}
export const HoverOverComponent: React.FC<HoverOverComponentProps> = (props) => {
  return (
    <span className='hover-over-text'>
      <div className='one-line'>name:{props.name}</div><br/>
      <div className='one-line'>id:{props.id}</div><br/>
      <div className='one-line'>nodeType:{props.nodeType}</div><br/>
    </span>
  )
}

export const VariableDefinitionNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='variable-definition-node base-node'/>
}

export const UseNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='use-node base-node'/>
}

export const FunctionCallNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='function-call-node base-node'/>
}


export const FunctionDefinitionNode: React.FC<NodeComponentProps> = ({ data }) => {
  const {estimatedMinX, estimatedMinY, estimatedMaxX, estimatedMaxY} = data as {
    estimatedMinX: number,
    estimatedMinY: number,
    estimatedMaxX: number,
    estimatedMaxY: number
  }
  const divStyle: React.CSSProperties = {}
  divStyle.width = estimatedMaxX - estimatedMinX
  divStyle.height = estimatedMaxY - estimatedMinY
  const minWidth = estimatedMaxX - estimatedMinX
  const minHeight = estimatedMaxY - estimatedMinY
  //<NodeResizer minWidth={minWidth} minHeight={minHeight}/>
  //
  return ( 
    <HandleNodeComponent>
      
      <div className = 'function-definition-node base-node' style = {divStyle}>
        <HoverOverComponent name={data.label as string} id={data.id as string} nodeType= {data.nodeType as string}/>
        <label htmlFor="text">{data.label as string}</label>
      </div>
    </HandleNodeComponent>
  )
}


export const ExitPointNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='exit-point-node base-node'/>
}

export const ValueNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='value-node base-node'/>
}

export const GroupNode: React.FC<NodeComponentProps> = ({ data }) => {
  const {estimatedMinX, estimatedMinY, estimatedMaxX, estimatedMaxY} = data as {
    estimatedMinX: number,
    estimatedMinY: number,
    estimatedMaxX: number,
    estimatedMaxY: number
  }
  const divStyle: React.CSSProperties = {}
  divStyle.width = estimatedMaxX - estimatedMinX
  divStyle.height = estimatedMaxY - estimatedMinY
  
  return ( 
    <div className = 'group-node' style = {divStyle}>
      {data.label as string}
    </div>
  )
}