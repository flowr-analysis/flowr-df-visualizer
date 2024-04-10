import { NodeProps } from "reactflow"
import { HandleNodeComponent } from "./handleNodeComponent"
import React from "react";

interface BodyNodeComponentProps{
  className: string
  data: NodeProps['data']
}

interface NodeComponentProps {
  readonly data: NodeProps['data']
}

export function BodyNodeComponent(props: React.PropsWithoutRef<BodyNodeComponentProps>){
  return (
    <HandleNodeComponent>
      <div className = {props.className}>
        <span className='hover-over-text'>{props.data.label}</span>
        <label htmlFor="text">{props.data.label}</label>
      </div>
    </HandleNodeComponent>
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