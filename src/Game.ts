import {WorkerWrapper} from "./WorkerWrapper";
import Renderer from "./Renderer";
import {EngineWorkerMessageTopic} from "./Enum";
import {StepReturn} from "./Engine";

export default class Game{
  private engine: WorkerWrapper;
  private renderer: Renderer;
  private engineReady: Promise<any>;
  private stepCount: number = 0;
  private stateBuffer: Array<StepReturn> = [];

  constructor(){
    this.engine = new WorkerWrapper("./EngineWorker.js");
    this.engine.post(EngineWorkerMessageTopic.ENGINE_INIT);
    this.engineReady = new Promise(resolve => {
      this.engine.once(EngineWorkerMessageTopic.ENGINE_READY, resolve);
    });
    this.renderer = new Renderer();

    window.addEventListener("keypress", ({charCode, keyCode}) => {
      this.engine.post(EngineWorkerMessageTopic.KEYPRESS, {charCode, keyCode});
    });
    window.addEventListener("keydown", ({charCode, keyCode}) => {
      this.engine.post(EngineWorkerMessageTopic.KEYDOWN, {charCode, keyCode});
    });
    window.addEventListener("keyup", ({charCode, keyCode}) => {
      this.engine.post(EngineWorkerMessageTopic.KEYUP, {charCode, keyCode});
    });

    /*
    this.engine.on(EngineWorkerMessageTopic.GAME_STATE, msg => {
      console.log(msg);
    });
    */

    this.engine.on(EngineWorkerMessageTopic.ITEM_NAME_TEST, msg => {
      console.log(msg.payload.name);
    });

    this.engine.on(EngineWorkerMessageTopic.GAME_STATE, msg => {
      this.engine.post(EngineWorkerMessageTopic.GAME_STATE_REQUEST);
      this.stepCount++;
      this.stateBuffer.push(msg.payload);
      requestAnimationFrame(this.rAFCallback);
    });

    this.renderer.attach(document.body);
  }

  private rAFCallback = () => {
    const state = this.stateBuffer.pop();
    if(state){
      this.renderer.render(state);
    }
  }

  public start(): void{
    this.engineReady.then(() => {
      this.engine.post(EngineWorkerMessageTopic.GAME_STATE_REQUEST);
    });
  }
}
