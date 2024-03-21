import { Handle, Position } from "reactflow";

export interface HandleNodeComponentProps {
   targetBackgroundColor: string
}

export function HandleNodeComponent(props : React.PropsWithChildren) {
   return (<>
      <Handle type="target" position={Position.Top} isConnectable={false} className="node-handle"/>
      {props.children}
      <Handle type="source" position={Position.Bottom} isConnectable={false} className="node-handle" />
   </>)
}
