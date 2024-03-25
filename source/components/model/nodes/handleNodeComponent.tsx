import { Handle, NodeProps, Position } from "reactflow";

export interface HandleNodeComponentProps {
   targetBackgroundColor: string
}

export interface BodyNodeComponentProps{
   className: string
   data: NodeProps['data']
}

export function HandleNodeComponent(props : React.PropsWithChildren) {
   return (<>
      <Handle type="target" position={Position.Top} isConnectable={false} className="node-handle"/>
      {props.children}
      <Handle type="source" position={Position.Bottom} isConnectable={false} className="node-handle" />
   </>)
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