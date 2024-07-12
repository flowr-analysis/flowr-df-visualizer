import { createRoot } from 'react-dom/client';
import '../css/main.css';
import '@xyflow/react/dist/style.css'
import '@xyflow/react/dist/base.css'
import { MainContainerComponent } from './components/mainContainerComponent';
import { OtherGraph, transformToVisualizationGraphForOtherGraph } from './components/model/graphBuilder';
import { ReactFlowProvider, Node } from '@xyflow/react';
import { LayoutFlow } from './components/graphComponent';
import { VisualizerWebsocketClient } from './components/network/visualizerWebsocketClient';
import { FormEvent } from 'react';
import { VisualizationGraph } from './components/model/graph';
import { RNode } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/model';
import { ParentInformation } from '@eagleoutice/flowr/r-bridge/lang-4.x/ast/model/processing/decorate';
/* old example
const otherGraph:OtherGraph =  {
  "rootVertices":["0","2","5"],
  "vertexInformation":[
    ["0",{"tag":"use","id":"0","name":"a", "when": 'always'}],
    ["2",{"tag":"use","id":"2","name":"unnamed-argument-2","environment":{"current":{"name":".GlobalEnv","id":"761","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"always"}],
    ["5",{"tag":"use","id":"5","name":"unnamed-argument-5","environment":{"current":{"name":".GlobalEnv","id":"763","memory":[["return",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"return","nodeId":"built-in"}]],["cat",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"cat","nodeId":"built-in"}]],["print",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"print","nodeId":"built-in"}]],["source",[{"kind":"built-in-function","scope":".GlobalEnv","used":"always","definedAt":"built-in","name":"source","nodeId":"built-in"}]]]},"level":0},"when":"always"}]],
    "edgeInformation":[["0",[["2",{"types":["reads"],"attribute":"always"}],["5",{"types":["reads"],"attribute":"always"}]]]]};
*/

const otherGraph: OtherGraph = {       "_idMap":{
  "size":13,
  "k2v":[[0,{
  "type":"RSymbol","location":[1,1,1,1],"content":"x","lexeme":"x","info":{
      "fullRange":[1,1,1,1],"additionalTokens":[],"fullLexeme":"x","id":0,"parent":4,"role":"binop-lhs","index":0,"depth":2}
  }],
  [1,{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}}],
  [2,{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}}],
  [3,{"type":"RBinaryOp","location":[1,8,1,8],"lhs":{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}},"rhs":{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}},"operator":"*","lexeme":"*","info":{"fullRange":[1,6,1,10],"additionalTokens":[],"fullLexeme":"2 * 3","id":3,"parent":4,"depth":2,"index":1,"role":"binop-rhs"}}],
  [4,{"type":"RBinaryOp","location":[1,3,1,4],"lhs":{"type":"RSymbol","location":[1,1,1,1],"content":"x","lexeme":"x","info":{"fullRange":[1,1,1,1],"additionalTokens":[],"fullLexeme":"x","id":0,"parent":4,"role":"binop-lhs","index":0,"depth":2}},"rhs":{"type":"RBinaryOp","location":[1,8,1,8],"lhs":{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}},"rhs":{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}},"operator":"*","lexeme":"*","info":{"fullRange":[1,6,1,10],"additionalTokens":[],"fullLexeme":"2 * 3","id":3,"parent":4,"depth":2,"index":1,"role":"binop-rhs"}},"operator":"<-","lexeme":"<-","info":{"fullRange":[1,1,1,10],"additionalTokens":[],"fullLexeme":"x <- 2 * 3","id":4,"parent":6,"depth":1,"index":0,"role":"expr-list-child"}}],
  [5,{"type":"RSymbol","location":[1,13,1,13],"content":"x","lexeme":"x","info":{"fullRange":[1,13,1,13],"additionalTokens":[],"fullLexeme":"x","id":5,"parent":6,"role":"expr-list-child","index":1,"depth":1}}],
  [6,{"type":"RExpressionList","children":[{"type":"RBinaryOp","location":[1,3,1,4],"lhs":{"type":"RSymbol","location":[1,1,1,1],"content":"x","lexeme":"x","info":{"fullRange":[1,1,1,1],"additionalTokens":[],"fullLexeme":"x","id":0,"parent":4,"role":"binop-lhs","index":0,"depth":2}},"rhs":{"type":"RBinaryOp","location":[1,8,1,8],"lhs":{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}},"rhs":{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}},"operator":"*","lexeme":"*","info":{"fullRange":[1,6,1,10],"additionalTokens":[],"fullLexeme":"2 * 3","id":3,"parent":4,"depth":2,"index":1,"role":"binop-rhs"}},"operator":"<-","lexeme":"<-","info":{"fullRange":[1,1,1,10],"additionalTokens":[],"fullLexeme":"x <- 2 * 3","id":4,"parent":6,"depth":1,"index":0,"role":"expr-list-child"}},{"type":"RSymbol","location":[1,13,1,13],"content":"x","lexeme":"x","info":{"fullRange":[1,13,1,13],"additionalTokens":[],"fullLexeme":"x","id":5,"parent":6,"role":"expr-list-child","index":1,"depth":1}}],"info":{"additionalTokens":[],"id":6,"depth":0,"role":"root","index":0}}],
  ["4-arg",{"type":"RBinaryOp","location":[1,3,1,4],"lhs":{"type":"RSymbol","location":[1,1,1,1],"content":"x","lexeme":"x","info":{"fullRange":[1,1,1,1],"additionalTokens":[],"fullLexeme":"x","id":0,"parent":4,"role":"binop-lhs","index":0,"depth":2}},"rhs":{"type":"RBinaryOp","location":[1,8,1,8],"lhs":{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}},"rhs":{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}},"operator":"*","lexeme":"*","info":{"fullRange":[1,6,1,10],"additionalTokens":[],"fullLexeme":"2 * 3","id":3,"parent":4,"depth":2,"index":1,"role":"binop-rhs"}},"operator":"<-","lexeme":"<-","info":{"fullRange":[1,1,1,10],"additionalTokens":[],"fullLexeme":"x <- 2 * 3","id":4,"parent":6,"depth":1,"index":0,"role":"expr-list-child"}}],["5-arg",{"type":"RSymbol","location":[1,13,1,13],"content":"x","lexeme":"x","info":{"fullRange":[1,13,1,13],"additionalTokens":[],"fullLexeme":"x","id":5,"parent":6,"role":"expr-list-child","index":1,"depth":1}}],["0-arg",{"type":"RSymbol","location":[1,1,1,1],"content":"x","lexeme":"x","info":{"fullRange":[1,1,1,1],"additionalTokens":[],"fullLexeme":"x","id":0,"parent":4,"role":"binop-lhs","index":0,"depth":2}}],["3-arg",{"type":"RBinaryOp","location":[1,8,1,8],"lhs":{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}},"rhs":{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}},"operator":"*","lexeme":"*","info":{"fullRange":[1,6,1,10],"additionalTokens":[],"fullLexeme":"2 * 3","id":3,"parent":4,"depth":2,"index":1,"role":"binop-rhs"}}],["1-arg",{"location":[1,6,1,6],"lexeme":"2","info":{"fullRange":[1,6,1,6],"additionalTokens":[],"fullLexeme":"2","id":1,"parent":3,"role":"binop-lhs","index":0,"depth":3},"type":"RNumber","content":{"num":2,"complexNumber":false,"markedAsInt":false}}],["2-arg",{"location":[1,10,1,10],"lexeme":"3","info":{"fullRange":[1,10,1,10],"additionalTokens":[],"fullLexeme":"3","id":2,"parent":3,"role":"binop-rhs","index":1,"depth":3},"type":"RNumber","content":{"num":3,"complexNumber":false,"markedAsInt":false}}]],
  "v2k":{}
},
"functionCache":[],
"rootVertices":[1,2,3,0,4,5],
"vertexInformation":
[
  [1,{"tag":"value","id":1}],
  [2,{"tag":"value","id":2}],
  [3,{"tag":"function-call","id":3,"name":"*","onlyBuiltin":true,"args":[{"nodeId":1},{"nodeId":2}]}],[0,{"tag":"variable-definition","id":0}],
  [4,{"tag":"function-call","id":4,"name":"<-","onlyBuiltin":true,"args":[{"nodeId":0},{"nodeId":3}]}],[5,{"tag":"use","id":5}]
],
"edgeInformation":[
  [3,[[1,{"types":65}],[2,{"types":65}]]],
  [4,[[3,{"types":64}],[0,{"types":72}]]],
  [0,[[3,{"types":2}],[4,{"types":2}]]],
  [5,[[0,{"types":1}]]]
]
}




let client: VisualizerWebsocketClient | undefined = undefined;
try{
client = new VisualizerWebsocketClient('ws://127.0.0.1:1042')
client.onFileAnalysisResponse = (json) => {
  console.log(JSON.stringify(json.results.dataflow.graph))
  updateGraph(json.results.normalize.ast, json.results.dataflow.graph as unknown as OtherGraph)
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
let graphFromOtherGraph: VisualizationGraph = {
  edges: [],
  nodesInfo: {nodes:[], nodeMap: new Map<string,Node>()}
  
}

let graphUpdater: ((graph: VisualizationGraph) => void) | undefined = undefined;
function setGraphUpdater(updater: (graph: VisualizationGraph) => void) {
  graphUpdater = updater;
}

function updateGraph(ast: RNode<ParentInformation>, graph: OtherGraph) {
  // borderline graph :D
  const newGraph = transformToVisualizationGraphForOtherGraph(ast, graph)
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

