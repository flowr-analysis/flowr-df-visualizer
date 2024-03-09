import { createRoot } from 'react-dom/client';
import '../css/main.css';
import React from 'react';
import { MainContainerComponent } from './components/mainContainerComponent';
import { GraphViewComponent } from './components/graphComponent';
import { Graph, transformToVisualizationGraph } from './components/model/graphTransformer';




const flowrGraph: Graph = {
  rootVertices: new Set(['1', '2']),
  vertexInformation: new Map([
    ['1', {name: 'foo', tag: 'use'}],
    ['2', {name: 'bar', tag: 'use'}]
  ]),
  edgeInformation: new Map([
    ['1', new Map([
      ['2', {types: {foo: 'foo'}}]
    ])]
  ])
}

// borderline graph :D
// excerpt from https://echarts.apache.org/examples//data/asset/data/les-miserables.json
let graph = transformToVisualizationGraph(flowrGraph)


const graphSeries = {
   tooltip: {},
   legend: [
     {
       data: ['foo', 'bar']
     }
   ],
   series: [
     {
       name: 'Les Miserables',
       type: 'graph',
       layout: 'none',
       data: graph.nodes,
       links: graph.links,
       roam: true,
       label: {
         show: true,
         position: 'right',
         formatter: '{b}'
       },
       labelLayout: {
         hideOverlap: true
       },
       scaleLimit: {
         min: 0.4,
         max: 2
       },
       lineStyle: {
         color: 'source',
         curveness: 0.3
       }
     }
   ]
 }


const graphRef: React.RefObject<GraphViewComponent> = React.createRef();

const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);
const root = createRoot(main);

root.render(
   <MainContainerComponent initialize={() => { console.log('Hey') }}>
      <button onClick={() => {
          graphRef.current?.updateTreeSeries(graphSeries)
        }}>All</button>
      <GraphViewComponent ref={graphRef} key="pattern" />
   </MainContainerComponent>
);

