import { Handle, Position } from '@xyflow/react'

 interface HandleNodeComponentProps {
   targetHandleId: string
   sourceHandleId: string
}

export const HandleNodeComponent:React.FC<React.PropsWithChildren<HandleNodeComponentProps>> = (props) => {
	return (<>
		<Handle id = {'top'} type="target" position={Position.Top} isConnectable={false} className="node-handle"/>
		{props.children}
		<Handle id = {'bottom'} type="source" position={Position.Bottom} isConnectable={false} className="node-handle" />
	</>)
}

