import { Handle, Position } from "reactflow";

export interface HandleNodeComponentProps {
   targetBackgroundColor: string
}

export function HandleNodeComponent(props : React.PropsWithChildren<HandleNodeComponentProps>) {
return (<>
   <Handle type="target" position={Position.Top} isConnectable={false}  style={{ background: props.targetBackgroundColor, border: 'none' }} />
   {props.children}
   <Handle type="source" position={Position.Bottom} isConnectable={false} style={{ background: 'none', border: 'none' }} />
</>)
}
