import { NodeProps } from "reactflow"
import { BodyNodeComoponent } from "./handleNodeComponent"

export function VariableDefinitionNode({ data } : { readonly data: NodeProps['data'] }) {
    return <BodyNodeComoponent data={data} className='variable-definition-node'/>
  }
  
  export function UseNode({ data } : { readonly data: NodeProps['data'] }){
    return <BodyNodeComoponent data={data} className='use-node'/>
  }
  
  export function FunctionCallNode({ data } : { readonly data: NodeProps['data'] }){
    return <BodyNodeComoponent data={data} className='function-call-node'/>
  }
  
  let idCounter = 0
  
  export function ExitPointNode({ data } : { readonly data: NodeProps['data'] }) {
    return <BodyNodeComoponent data={data} className='exit-point-node'/>
  }