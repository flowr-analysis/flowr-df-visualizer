import type { ConnectionLineComponentProps, Node, NodeProps } from '@xyflow/react'
import { NodeResizer, getBezierPath } from '@xyflow/react'
import { HandleNodeComponent } from './handle-node-component'
import React from 'react'

import { getEdgeParams } from '../edges/edge-base'
import { VisualStateModel } from '../visual-state-model'


function FloatingConnectionLine(props: ConnectionLineComponentProps) {
	const { toX, toY, fromPosition, toPosition, fromNode } = props

	if(!fromNode) {
		return null
	}

	const targetNode: Node = {
		id:       'connection-target',
		width:    1,
		height:   1,
		position: { x: toX, y: toY },
		data:     {}
	}

	const { sourceX, sourceY } = getEdgeParams(fromNode, targetNode, false)
	const [edgePath] = getBezierPath({
		sourceX:        sourceX,
		sourceY:        sourceY,
		sourcePosition: fromPosition,
		targetPosition: toPosition,
		targetX:        toX,
		targetY:        toY
	})

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
	)
}

export default FloatingConnectionLine




interface BodyNodeComponentProps{
  readonly className: string
  readonly data:      NodeProps['data']
}

interface NodeComponentProps {
  readonly data: NodeProps['data']
}

const BodyNodeComponent: React.FC<BodyNodeComponentProps> = ({ data, className }) => {
	const visualStateModel = data.visualStateModel as VisualStateModel ?? new VisualStateModel()
	const isGreyedOut = visualStateModel.isGreyedOutMap.get(data.nodeType as string ?? '') ?? false
	const bodyClassName = className + (isGreyedOut ? ' legend-passive' : '')
	const shownLabel = data.label as string + (data.isNodeIdShown ? ' (' + data.id + ')': '')
	return (
		<HandleNodeComponent targetHandleId={data.id as string + '-targetHandle'} sourceHandleId={data.id as string + '-sourceHandle'}>
			<div className = {bodyClassName} id={`in-graph-node-${data.id}`}>
				{(data.nodeCount as number < 200) && <HoverOverComponent name={data.label as string} id={data.id as string} nodeType= {data.nodeType as string}/>}
				<label htmlFor="text">{shownLabel}</label>
			</div>
		</HandleNodeComponent>
	)
}

interface HoverOverComponentProps{
  readonly name:     string,
  readonly id:       string,
  readonly nodeType: string
}
export const HoverOverComponent: React.FC<HoverOverComponentProps> = ({ name, id , nodeType }) => {
	return (
		<span className='hover-over-text'>
			<div className='one-line'>name:{name}</div><br/>
			<div className='one-line'>id:{id}</div><br/>
			<div className='one-line'>nodeType:{nodeType}</div><br/>
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


export const FunctionDefinitionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
	const { estimatedMinX, estimatedMinY, estimatedMaxX, estimatedMaxY } = data as {
    estimatedMinX: number,
    estimatedMinY: number,
    estimatedMaxX: number,
    estimatedMaxY: number
  }
	const divStyle: React.CSSProperties = {}
	divStyle.width = estimatedMaxX - estimatedMinX
	divStyle.height = estimatedMaxY - estimatedMinY

	return (
		<>
			<div className = 'function-call-hover-over' id = {id + '-hover-div'}> 
			<NodeResizer lineClassName='function-definition-node function-definition-node-resizer-line' handleClassName='function-definition-node function-definition-node-resizer-edge-dot' />
			<BodyNodeComponent data = {data} className='function-definition-node base-node'/>
			
			</div>
			<button id = {id + '-hover-over-button'} className='function-call-reduce-button'>Reduce</button>
			
		</>
	)
}


export const ExitPointNode: React.FC<NodeComponentProps> = ({ data }) => {
	return <BodyNodeComponent data={data} className='exit-point-node base-node'/>
}

export const ValueNode: React.FC<NodeComponentProps> = ({ data }) => {
	return <BodyNodeComponent data={data} className='value-node base-node'/>
}

export const GroupNode: React.FC<NodeComponentProps> = ({ data }) => {
	const { estimatedMinX, estimatedMinY, estimatedMaxX, estimatedMaxY } = data as {
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
