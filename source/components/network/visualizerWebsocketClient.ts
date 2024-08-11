
import type { FileAnalysisRequestMessage, FileAnalysisResponseMessageJson } from '@eagleoutice/flowr/cli/repl/server/messages/analysis'
import type { FlowrHelloResponseMessage } from '@eagleoutice/flowr/cli/repl/server/messages/hello'

export class VisualizerWebsocketClient{
	endpoint:  string
	websocket: WebSocket
	id:        number
	connected: boolean

	constructor(endpoint: string){
		this.endpoint = endpoint
		this.websocket = new WebSocket(endpoint)
		this.id = 0
		this.connected = false
		this.websocket.onopen = () => {
			console.log('connected')
			this.connected = true
		}
		this.websocket.onerror = (event) => {
			console.log('error', event)
			this.connected = false
		}
		this.websocket.onmessage = (event) => {
			const parsedJson = JSON.parse(event.data)
			if(parsedJson.type === 'response-file-analysis'){
				const requestResponse: FileAnalysisResponseMessageJson = parsedJson
				this.onFileAnalysisResponse?.(requestResponse)
			} else if(parsedJson.type === 'hello') {
				const requestResponse: FlowrHelloResponseMessage = parsedJson
				this.onHelloMessage?.(requestResponse)
			}
		}
	}

	public onFileAnalysisResponse: ((response: FileAnalysisResponseMessageJson) => void) | undefined
  
	public onHelloMessage: ((response:FlowrHelloResponseMessage) => void) | undefined
  
	sendAnalysisRequestJSON(rCode:string):void{
		console.log('send request for', rCode)
    
		const msg: FileAnalysisRequestMessage = {
			id:       this.id.toString(),
			type:     'request-file-analysis',
			content:  rCode,
			filename: 'request.R',
		}
		this.id++
		this.websocket.send(JSON.stringify(msg) + '\n')
	}
  
}