
import { FileAnalysisRequestMessage, FileAnalysisResponseMessageJson } from '@eagleoutice/flowr/cli/repl/server/messages/analysis';

export class VisualizerWebsocketClient{
  endpoint:string
  websocket:WebSocket
  id:number

  constructor(endpoint:string){
    this.endpoint = endpoint
    this.websocket = new WebSocket(endpoint)
    this.id = 0
    this.websocket.onmessage = (event) => {
      const parsedJson = JSON.parse(event.data)
      if(parsedJson.type === 'response-file-analysis'){
        const requestResponse: FileAnalysisResponseMessageJson = parsedJson
        this.onFileAnalysisResponse(requestResponse)
      }
    }
  }

  onFileAnalysisResponse(response:FileAnalysisResponseMessageJson){}
  
  sendAnalysisRequestJSON(rCode:string):void{
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