import { createRoot } from 'react-dom/client'
import '../css/main.css'
import '@xyflow/react/dist/style.css'
import '@xyflow/react/dist/base.css'
import { MainContainerComponent } from './components/main-container'
import type { OtherGraph } from './components/model/graph-builder'
import { transformToVisualizationGraphForOtherGraph } from './components/model/graph-builder'
import type { Node } from '@xyflow/react'
import { ReactFlowProvider } from '@xyflow/react'
import { LayoutFlow, reloadGraph, startLoadingAnimation } from './components/graph-viewer'
import { VisualizerWebsocketClient } from './components/network/visualizerWebsocketClient'
import type { FormEvent } from 'react'
import type { VisualizationGraph } from './components/model/graph'
import type { RNode } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/model'
import type { ParentInformation } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/decorate'
import { LegendComponent } from './components/graph-legend'
import { VisualStateModel } from './components/model/visual-state-model'
import * as monaco from 'monaco-editor'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { EdgeTypeName } from '@eagleoutice/flowr/dataflow/graph/edge'
import { TwoKeyMap } from './components/utility/two-key-map'


const firstValueInEditor = localStorage.getItem('monaco-text') ?? 'x <- 2 * 3; x'
export let client: VisualizerWebsocketClient | undefined = undefined
export let loadingButtonTimerId :NodeJS.Timer
export function setLoadingButtonTimerId(id: NodeJS.Timer){
	loadingButtonTimerId = id
}

try {
	client = new VisualizerWebsocketClient('ws://127.0.0.1:1042')
	client.onFileAnalysisResponse = (json) => {
		console.log(JSON.stringify(json.results.dataflow.graph))
		const somePromise = updateGraph(json.results.normalize.ast, json.results.dataflow.graph as unknown as OtherGraph)
		
		//cancel loading animation
		somePromise.finally(() => {
			clearInterval(loadingButtonTimerId)
			const svgIcon = document.getElementById('reload-button-icon-container') as HTMLDivElement
			svgIcon.style.transform = ''
		})
	}
	client.onHelloMessage = (json) => {
		console.log('hello', json)
		startLoadingAnimation()
		client?.sendAnalysisRequestJSON(firstValueInEditor)
	}
} catch(e){
	console.log(e)
}

const graphFromOtherGraph: VisualizationGraph = {
	edgesInfo:     {edges: [], edgeConnectionMap: new TwoKeyMap<string,string, Set<EdgeTypeName>>(), reversedEdgeConnectionMap: new TwoKeyMap<string,string, boolean>()},
	nodesInfo: { nodes: [], nodeMap: new Map<string,Node>(), nodeChildrenMap: new Map<string,string[]>(), nodeCount: 0}

}

let graphUpdater: ((graph: VisualizationGraph) => void) | undefined = undefined
function setGraphUpdater(updater: (graph: VisualizationGraph) => void) {
	graphUpdater = updater
}

async function updateGraph(ast: RNode<ParentInformation>, graph: OtherGraph) {
	// borderline graph :D
	const newGraph = transformToVisualizationGraphForOtherGraph(ast, graph)
	graphUpdater?.(newGraph)
}

const main = document.createElement('div')
main.id = 'main'
document.body.appendChild(main)
const root = createRoot(main)
export const visualStateModel = new VisualStateModel()



root.render(
	<MainContainerComponent initialize={() => {
		console.log('Hey')
	}}>
    <PanelGroup direction='horizontal'>
      <Panel className = 'left-side' defaultSize = {30}>  
		<div id='editor-target' className = 'editor-div'> </div>
      </Panel>
    
      <PanelResizeHandle/>
      <Panel className = 'reactflow-div'>
        <div style={{ position: 'relative', top: 0, right: 0, width: '100%', height: '100%' }}>
          <ReactFlowProvider>
            <LayoutFlow graph={graphFromOtherGraph} assignGraphUpdater={setGraphUpdater} visualStateModel={visualStateModel}/>
          </ReactFlowProvider>
        </div>
        <LegendComponent visualStateModel={visualStateModel}/>
        
      </Panel>
    </PanelGroup>
	</MainContainerComponent>
)

window.MonacoEnvironment = {
	getWorker: () => {
		return new Worker('monaco-editor/vs/base/worker/workerMain.js')
	}
}
export let monacoEditor:monaco.editor.IStandaloneCodeEditor

window.onload = () => {

	monacoEditor = monaco.editor.create((document.getElementById('editor-target') as HTMLElement), {
		value:           firstValueInEditor,
		language:        'r',
		automaticLayout: true,
	})
	monacoEditor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, reloadGraph)
	monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, reloadGraph)
}


