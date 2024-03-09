import { createRoot } from 'react-dom/client';
import '../css/main.css';
import { MainContainerComponent } from './components/mainContainerComponent';
import { Graph, transformToVisualizationGraph } from './components/model/graphTransformer';
import { ReactFlowProvider } from 'reactflow';
import { LayoutFlow } from './components/graphComponent';


const flowrGraph: Graph = {
  rootVertices: new Set(['1', '2']),
  vertexInformation: new Map([
    ['1', {name: 'foo', tag: 'use'}],
    ['2', {name: 'bar', tag: 'use'}],
    ['4', {name: 'bar', tag: 'use'}],
    ['5', {name: 'bar', tag: 'use'}],
    ['3', {name: 'bar', tag: 'use'}],
    ['9', {name: 'bar', tag: 'use'}],
  ]),
  edgeInformation: new Map([
    ['1', new Map([
      ['2', {types: {foo: 'foo'}}],
      ['9', {types: {foo: 'foo'}}]
    ])],
    ['2', new Map([
      ['3', {types: {foo: 'foo'}}],
      ['4', {types: {foo: 'foo'}}]
    ])],
    ['4', new Map([
      ['5', {types: {foo: 'foo'}}]
    ])],
    ['5', new Map([
      ['3', {types: {foo: 'foo'}}]
    ])],
    ['9', new Map([
      ['2', {types: {foo: 'foo'}}]
    ])]
  ])
}

// borderline graph :D
// excerpt from https://echarts.apache.org/examples//data/asset/data/les-miserables.json
let graph = transformToVisualizationGraph(flowrGraph)


const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);
const root = createRoot(main);

root.render(
   <MainContainerComponent initialize={() => { console.log('Hey') }}>
      <ReactFlowProvider>
        <LayoutFlow graph={graph}  />
      </ReactFlowProvider>
   </MainContainerComponent>
);

