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
        <label htmlFor="text">{props.data.label}</label>
      </div>
    </HandleNodeComponent>
  )
}

export const VariableDefinitionNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='variable-definition-node'/>
}

export const UseNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='use-node'/>
}

export const FunctionCallNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='function-call-node'/>
}

export const ExitPointNode: React.FC<NodeComponentProps> = ({ data }) => {
  return <BodyNodeComponent data={data} className='exit-point-node'/>
}