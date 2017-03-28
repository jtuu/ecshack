import System from "./System";
import {ComponentType} from "../../Enum";
import Entity from "../Entity";
import {engine, entityManager} from "../../EngineWorker";
import {wasAnyKeyPressed, wasKeyPressed, wasKeyReleased, resetKeyboardInput} from "../../KeyboardInput";
import {KeyCode, Direction, CommandType} from "../../Enum";
import {keyCodeCommandMap} from "../../KeyConfig";

const movementKeys = [
  KeyCode.DOM_VK_NUMPAD1,
  KeyCode.DOM_VK_NUMPAD2,
  KeyCode.DOM_VK_NUMPAD3,
  KeyCode.DOM_VK_NUMPAD4,
  KeyCode.DOM_VK_NUMPAD6,
  KeyCode.DOM_VK_NUMPAD7,
  KeyCode.DOM_VK_NUMPAD8,
  KeyCode.DOM_VK_NUMPAD9
];

const movementCommandDirectionMap = {
  [CommandType.MOVE_UP]: Direction.UP,
  [CommandType.MOVE_RIGHT]: Direction.RIGHT,
  [CommandType.MOVE_DOWN]: Direction.DOWN,
  [CommandType.MOVE_LEFT]: Direction.LEFT,
  [CommandType.MOVE_UP_RIGHT]: Direction.UP_RIGHT,
  [CommandType.MOVE_UP_LEFT]: Direction.UP_LEFT,
  [CommandType.MOVE_DOWN_RIGHT]: Direction.DOWN_RIGHT,
  [CommandType.MOVE_DOWN_LEFT]: Direction.DOWN_LEFT
};

export class KeyboardControlSystem implements System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.KeyboardControlled];

  public update(entities: Iterable<Entity>): boolean{
    for(const entity of entities){
      const controlComponent = entityManager.getComponent(entity, ComponentType.KeyboardControlled);
      if(controlComponent.state.needsInput && !wasAnyKeyPressed()){
        return true;
      }

      if(entityManager.hasComponent(entity, ComponentType.Movement)){
        for(const keyCode of movementKeys){
          if(wasKeyPressed(keyCode)){
            const cmd = keyCodeCommandMap[keyCode];
            if(movementCommandDirectionMap.hasOwnProperty(cmd)){
              const movement = entityManager.getComponent(entity, ComponentType.Movement).state;
              movement.direction = movementCommandDirectionMap[cmd];
              break;
            }
          }
        }
      }

      resetKeyboardInput();
    }
    return false;
  }
}
