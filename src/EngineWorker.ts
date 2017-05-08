importScripts("GlobalConstants.js");

import {Engine} from "./Engine";
import {WorkerWrapper} from "./WorkerWrapper";
import {onKeypress, onKeydown, onKeyup} from "./KeyboardInput";
import {EngineWorkerMessageTopic, KeyCode} from "./Enum";
import {makeName} from "./ItemName";
import {EntityManager} from "./ecs/EntityManager";

const host = new WorkerWrapper(self);

export var engine: Engine;
export var entityManager: EntityManager;

host.on(EngineWorkerMessageTopic.KEYPRESS, msg => {
  onKeypress(msg.payload);
  if(msg.payload.keyCode === KeyCode.DOM_VK_END){
    host.post(EngineWorkerMessageTopic.ITEM_NAME_TEST, {name: makeName()});
  }
});

host.on(EngineWorkerMessageTopic.KEYDOWN, msg => {
  onKeydown(msg.payload);
});

host.on(EngineWorkerMessageTopic.KEYUP, msg => {
  onKeyup(msg.payload);
});

host.on(EngineWorkerMessageTopic.ENGINE_INIT, msg => {
  engine = new Engine(msg.payload);
  entityManager = engine.entityManager;

  const gameLoop = engine.run();

  host.on(EngineWorkerMessageTopic.GAME_STATE_REQUEST, msg => {
    const step = gameLoop.next();
    if(!step.done){
      host.post(EngineWorkerMessageTopic.GAME_STATE, step.value);
    }
  });

  host.post(EngineWorkerMessageTopic.ENGINE_READY);
});
