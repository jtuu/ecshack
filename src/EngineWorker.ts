import {Engine} from "./Engine";
import {WorkerWrapper} from "./WorkerWrapper";
import {onKeypress, onKeydown, onKeyup} from "./KeyboardInput";
import {EngineWorkerMessageTopic, KeyCode} from "./Enum";
import {makeName2} from "./ItemName";

export const engine = new Engine({});
export const {entityManager} = engine;
const host = new WorkerWrapper(self);

host.on(EngineWorkerMessageTopic.KEYPRESS, event => {
  onKeypress(event.payload);
  if(event.payload.keyCode === KeyCode.DOM_VK_END){
    host.post(EngineWorkerMessageTopic.ITEM_NAME_TEST, {name: makeName2()});
  }
});

host.on(EngineWorkerMessageTopic.KEYDOWN, event => {
  onKeydown(event.payload);
});

host.on(EngineWorkerMessageTopic.KEYUP, event => {
  onKeyup(event.payload);
});


const gameLoop = engine.run();

host.on(EngineWorkerMessageTopic.GAME_STATE_REQUEST, msg => {
  const step = gameLoop.next();
  if(!step.done){
    host.post(EngineWorkerMessageTopic.GAME_STATE, step.value);
  }
});


host.post(EngineWorkerMessageTopic.ENGINE_READY);
