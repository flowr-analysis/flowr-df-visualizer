
import { FileAnalysisRequestMessage, FileAnalysisResponseMessageJson } from '@eagleoutice/flowr/cli/repl/server/messages/analysis';

export class VisualizerWebsocketClient{
  endpoint:string
  websocket:WebSocket
  id:number

  constructor(endpoint:string){
    this.endpoint = endpoint
    this.websocket = new WebSocket(endpoint)
    this.id = 0
    this.websocket.onmessage = function(event) {
      const parsedJson = JSON.parse(event.data)
      if(parsedJson.type === 'response-file-analysis'){
        const requestResponse: FileAnalysisResponseMessageJson = parsedJson
        //TODO: do smth with results
      }
    }
  }

  sendAnalysisRequestJSON(rCode:string){
    const msg: FileAnalysisRequestMessage = {
      id: this.id.toString(),
      type:     'request-file-analysis',
      content:  rCode,
      filename: 'request.R',
    }
    this.id++
    this.websocket.send(JSON.stringify(msg));
  }
  
}