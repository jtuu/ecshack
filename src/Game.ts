import {WorkerWrapper} from "./WorkerWrapper";
import Renderer from "./Renderer";
import {EngineWorkerMessageTopic} from "./Enum";

export default class Game{
  private engine: WorkerWrapper;
  private renderer: Renderer;
  private engineReady: Promise<any>;
  private frameCount: number = 0;

  constructor(){
    this.engine = new WorkerWrapper("./EngineWorker.js");
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
      this.frameCount++;
      requestAnimationFrame(() => {
        this.renderer.render(msg.payload);
        this.engine.post(EngineWorkerMessageTopic.GAME_STATE_REQUEST);
      });
    });

    this.renderer.attach(document.body);
  }

  public start(): void{
    this.engineReady.then(() => {
      this.engine.post(EngineWorkerMessageTopic.GAME_STATE_REQUEST);
    });
  }
}
