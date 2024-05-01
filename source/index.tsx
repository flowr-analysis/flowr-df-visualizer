import { createRoot } from 'react-dom/client';
import '../css/main.css';
import { MainContainerComponent } from './components/mainContainerComponent';
import { Graph, OtherGraph, transformToVisualizationGraphForOtherGraph } from './components/model/graphTransformer';
import { ReactFlowProvider } from 'reactflow';
import { LayoutFlow } from './components/graphComponent';


const otherGraph:OtherGraph =  {
  "rootVertices":["0","2","5"],
  "vertexInformation":[
    ["0",{"tag":"use","id":"0","name":"a","environment":{"current":{"name":".GlobalEnv","id":"760","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"maybe"}],
    ["2",{"tag":"use","id":"2","name":"unnamed-argument-2","environment":{"current":{"name":".GlobalEnv","id":"761","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"always"}],
    ["5",{"tag":"use","id":"5","name":"unnamed-argument-5","environment":{"current":{"name":".GlobalEnv","id":"763","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"always"}]],
    "edgeInformation":[["0",[["2",{"types":["reads"],"attribute":"always"}],["5",{"types":["reads"],"attribute":"always"}]]]]};

const flowrGraph: Graph = {
  rootVertices: new Set(['1', '2']),
  vertexInformation: new Map([
    ['1', {name: 'foooooooooooooooooooooooooo', tag: 'use'}],
    ['2', {name: 'exitPoint', tag: 'exit-point'}],
    ['4', {name: 'useNode', tag: 'use'}],
    ['5', {name: 'functionCall', tag: 'function-call'}],
    ['3', {name: 'variableDefinition', tag: 'variable-definition'}],
    ['9', {name: 'functionDefinition', tag: 'function-definition'}],
    ['10', {name: 'exitPoint', tag: 'exit-point'}],
  ]),
  edgeInformation: new Map([
    ['1', new Map([
      ['2', {types: {foo: 'bar1'}}],
      ['9', {types: {foo: 'bar2'}}]
    ])],
    ['2', new Map([
      ['3', {types: {foo: 'bar3'}}],
      ['4', {types: {foo: 'bar4'}}]
    ])],
    ['4', new Map([
      ['5', {types: {foo: 'bar5'}}]
    ])],
    ['5', new Map([
      ['3', {types: {foo: 'bar6'}}]
    ])],
    ['9', new Map([
      ['2', {types: {foo: 'bar7'}}]
    ])]
  ])
}

// borderline graph :D
// let graph = transformToVisualizationGraph(flowrGraph)
let graphFromOtherGraph = transformToVisualizationGraphForOtherGraph(otherGraph)

// console.log(graph)
console.log(graphFromOtherGraph)

const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);
const root = createRoot(main);

root.render(
  <MainContainerComponent initialize={() => { console.log('Hey') }}>
    <ReactFlowProvider>
        <LayoutFlow graph={graphFromOtherGraph}/>
    </ReactFlowProvider>
  </MainContainerComponent>
);

