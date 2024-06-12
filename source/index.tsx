import { createRoot } from 'react-dom/client';
import '../css/main.css';
import { MainContainerComponent } from './components/mainContainerComponent';
import { OtherGraph, transformToVisualizationGraphForOtherGraph } from './components/model/graphTransformer';
import { ReactFlowProvider } from 'reactflow';
import { LayoutFlow } from './components/graphComponent';
import { VisualizerWebsocketClient } from './components/network/visualizerWebsocketClient';
import { FormEvent } from 'react';
import { VisualizationGraph } from './components/model/graph';

const otherGraph:OtherGraph =  {
  "rootVertices":["0","2","5"],
  "vertexInformation":[
    ["0",{"tag":"use","id":"0","name":"a", "when": 'always'}],
    ["2",{"tag":"use","id":"2","name":"unnamed-argument-2","environment":{"current":{"name":".GlobalEnv","id":"761","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"always"}],
    ["5",{"tag":"use","id":"5","name":"unnamed-argument-5","environment":{"current":{"name":".GlobalEnv","id":"763","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"always"}]],
    "edgeInformation":[["0",[["2",{"types":["reads"],"attribute":"always"}],["5",{"types":["reads"],"attribute":"always"}]]]]};


let client: VisualizerWebsocketClient | undefined = undefined;
try{
client = new VisualizerWebsocketClient('ws://127.0.0.1:1042')
client.onFileAnalysisResponse = (json) => {
  console.log(JSON.stringify(json.results.dataflow.graph))
  console.log(json.results.normalize)
  updateGraph(json.results.dataflow.graph as unknown as OtherGraph)
}
client.onHelloMessage = (json) => {
  console.log('hello', json);
  client?.sendAnalysisRequestJSON('x <- 2 * 3; x')
}
} catch(e){
  console.log(e)
}


let currentValue: string = ''
function onRCodeInputChange(event: FormEvent<HTMLInputElement>) {
  currentValue = event.currentTarget.value;
}

function onRCodeRequest() {
  client?.sendAnalysisRequestJSON(currentValue)
}
let graphFromOtherGraph = transformToVisualizationGraphForOtherGraph(otherGraph)

let graphUpdater: ((graph: VisualizationGraph) => void) | undefined = undefined;
function setGraphUpdater(updater: (graph: VisualizationGraph) => void) {
  graphUpdater = updater;
}

function updateGraph(graph: OtherGraph) {
  // borderline graph :D
  let newGraph = transformToVisualizationGraphForOtherGraph(graph)
  graphUpdater?.(newGraph);
}


const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);
const root = createRoot(main);

root.render(
  <MainContainerComponent initialize={() => { console.log('Hey') }}>
    <ReactFlowProvider>
        <LayoutFlow graph={graphFromOtherGraph} assignGraphUpdater={setGraphUpdater} />
    </ReactFlowProvider>
    <div className='r-code-input'>
    <input onChange={onRCodeInputChange}></input>
    <button onClick={onRCodeRequest}>Send R code</button>
    </div>
  </MainContainerComponent>
);

