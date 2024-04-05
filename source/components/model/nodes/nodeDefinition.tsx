import { NodeProps } from "reactflow"
import { HandleNodeComponent } from "./handleNodeComponent"

interface BodyNodeComponentProps{
  className: string
  data: NodeProps['data']
}

export function BodyNodeComoponent(props: React.PropsWithoutRef<BodyNodeComponentProps>){
  return (
    <HandleNodeComponent>
      <div className = {props.className}>
        <label htmlFor="text">{props.data.label}</label>
      </div>
    </HandleNodeComponent>
  )
}

export function VariableDefinitionNode({ data } : { readonly data: NodeProps['data'] }) {
  return <BodyNodeComoponent data={data} className='variable-definition-node'/>
}
  
export function UseNode({ data } : { readonly data: NodeProps['data'] }){
  return <BodyNodeComoponent data={data} className='use-node'/>
}
  
export function FunctionCallNode({ data } : { readonly data: NodeProps['data'] }){
  return <BodyNodeComoponent data={data} className='function-call-node'/>
}

export function ExitPointNode({ data } : { readonly data: NodeProps['data'] }) {
  return <BodyNodeComoponent data={data} className='exit-point-node'/>
}