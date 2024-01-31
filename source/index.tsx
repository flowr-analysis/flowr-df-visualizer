import { createRoot } from 'react-dom/client';
import '../css/main.css';
import React from 'react';
import { MainContainerComponent } from './components/mainContainerComponent';
import { GraphViewComponent } from './components/graphComponent';
import { FileAnalysisRequestMessage } from '@eagleoutice/flowr/cli/repl/server/messages/analysis';

function initialize() {
   console.log('initialize');
}

try {
  let socket = new WebSocket("ws://flowr.informatik.uni-ulm.de:1042");
  socket.onmessage = function(event) {
    console.log(event.data);
  }
  const msg: FileAnalysisRequestMessage = {
    id:       '1',
    type:     'request-file-analysis',
    content:  'x <- 2 * 3; x',
    filename: 'test.R',
    format:   'json'
  }
  socket.send(JSON.stringify(msg));
} catch (e) {
  console.error(e);
}

// borderline graph :D
// excerpt from https://echarts.apache.org/examples//data/asset/data/les-miserables.json
const graph = {
      "nodes": [
        {
          "id": "0",
          "name": "Myriel",
          "symbolSize": 19.12381,
          "x": -266.82776,
          "y": 299.6904,
          "value": 28.685715,
          "category": 0
        },
        {
          "id": "1",
          "name": "Napoleon",
          "symbolSize": 2.6666666666666665,
          "x": -418.08344,
          "y": 446.8853,
          "value": 4,
          "category": 0
        }
      ],
      "links": [
         {
           "source": "1",
           "target": "0"
         }
      ],
      "categories": [
         {
           "name": "A"
         },
         {
           "name": "B"
         },
         {
           "name": "C"
         },
         {
           "name": "D"
         },
         {
           "name": "E"
         },
         {
           "name": "F"
         },
         {
           "name": "G"
         },
         {
           "name": "H"
         },
         {
           "name": "I"
         }
       ]
}

const graphSeries = {
   tooltip: {},
   legend: [
     {
       data: graph.categories.map(function (a: { name: string }) {
         return a.name;
       })
     }
   ],
   series: [
     {
       name: 'Les Miserables',
       type: 'graph',
       layout: 'none',
       data: graph.nodes,
       links: graph.links,
       categories: graph.categories,
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
   <MainContainerComponent initialize={initialize}>
      <button onClick={() => graphRef.current?.updateTreeSeries(graphSeries)}>All</button>
      <GraphViewComponent ref={graphRef} key="pattern" />
   </MainContainerComponent>
);

