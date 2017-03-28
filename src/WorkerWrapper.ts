import {EngineWorkerMessageTopic} from "./Enum";

export interface WorkerMessage{
  topic: string | number;
  payload: any;
}

export type WorkerMessageCallback = (message: WorkerMessage) => void;

export class WorkerWrapper{
  private worker: Worker;
  private handlerStore: Map<string | number, Set<WorkerMessageCallback>> = new Map();

  constructor(src: string | any){

    //XXX: kinda hacky
    if(typeof src === "string"){
      const name = (src.split("/").pop() || "").split(".").shift();
      this.worker = new Worker(src);
    }else{
      this.worker = src;
    }

    this.worker.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent): void{
    const handlers = this.handlerStore.get(event.data.topic);
    if(handlers){
      for(const handler of handlers.values()){
        handler({
          topic: event.data.topic,
          payload: event.data.payload
        });
      }
    }
  }

  public addEventListener(topic: EngineWorkerMessageTopic, handler: WorkerMessageCallback): void{
    var handlers = this.handlerStore.get(topic);
    if(!handlers){
      handlers = new Set();
      this.handlerStore.set(topic, handlers);
    }
    handlers.add(handler);
  }

  public on(topic: EngineWorkerMessageTopic, handler: WorkerMessageCallback): void{
    this.addEventListener(topic, handler);
  }

  public once(topic: EngineWorkerMessageTopic, handler: WorkerMessageCallback): void{
    this.on(topic, msg => {
      handler(msg);
      this.removeEventListener(topic, handler);
    });
  }

  public removeEventListener(topic: EngineWorkerMessageTopic, handler: WorkerMessageCallback): boolean{
    const handlers = this.handlerStore.get(topic);
    if(handlers){
      return handlers.delete(handler);
    }
    return false;
  }

  public post(topic: EngineWorkerMessageTopic, payload?: any): void{
    this.worker.postMessage({topic, payload});
  }
}
