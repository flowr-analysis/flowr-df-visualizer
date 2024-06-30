import { ConnectionLineComponentProps, Node, NodeProps , Position} from "reactflow"
import { HandleNodeComponent } from "./handleNodeComponent"
import React from "react";
import { ProgressPlugin } from "webpack";

import { getBezierPath } from 'reactflow';
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
    positionAbsolute: { x: toX, y: toY },
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
        <HoverOverComponent name={props.data.label} id={props.data.id} nodeType= {props.data.nodeType}/>
        <label htmlFor="text">{props.data.label}</label>
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

export const ExitPointNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='exit-point-node base-node'/>
}

export const ValueNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='value-node base-node'/>
}

export const GroupNode: React.FC<NodeComponentProps> = ({ data }) => {
  return ( 
    <div className = 'group-node'>
      {data.label}
    </div>
  )
}