import {System} from "./System";
import {ComponentType} from "../../Enum";
import {Entity} from "../Entity";
import {engine, entityManager} from "../../EngineWorker";
import {wasKeyReleased, wasAnyKeyReleased, resetKeyboardInput} from "../../KeyboardInput";
import {KeyCode, Direction, CommandType} from "../../Enum";
import {keyCodeCommandMap} from "../../KeyConfig";

const movementCommandDirectionMap = new Map([
  [CommandType.MOVE_UP, Direction.UP],
  [CommandType.MOVE_RIGHT, Direction.RIGHT],
  [CommandType.MOVE_DOWN, Direction.DOWN],
  [CommandType.MOVE_LEFT, Direction.LEFT],
  [CommandType.MOVE_UP_RIGHT, Direction.UP_RIGHT],
  [CommandType.MOVE_UP_LEFT, Direction.UP_LEFT],
  [CommandType.MOVE_DOWN_RIGHT, Direction.DOWN_RIGHT],
  [CommandType.MOVE_DOWN_LEFT, Direction.DOWN_LEFT]
]);

//XXX move these
const commandEnergyCostMap = new Map([
  [CommandType.MOVE_UP, 100],
  [CommandType.MOVE_RIGHT, 100],
  [CommandType.MOVE_DOWN, 100],
  [CommandType.MOVE_LEFT, 100],
  [CommandType.MOVE_UP_RIGHT, 100],
  [CommandType.MOVE_UP_LEFT, 100],
  [CommandType.MOVE_DOWN_RIGHT, 100],
  [CommandType.MOVE_DOWN_LEFT, 100]
]);

function hasEnoughEnergy(entity: Entity, command: CommandType){
  if(commandEnergyCostMap.has(command) && entityManager.hasComponent(entity, ComponentType.Energy)){
    const energyCost = commandEnergyCostMap.get(command);
    const energy = entityManager.getComponent(entity, ComponentType.Energy).state;
    return energyCost <= energy.value;
  }
  return true;
}

function isValidKeyCode(keyCode: KeyCode){
  return keyCodeCommandMap.has(keyCode);
}

export class KeyboardControlSystem extends System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.KeyboardControlled];

  public update(entities: Iterable<Entity>): boolean{
    for(const entity of entities){
      const controlComponent = entityManager.getComponent(entity, ComponentType.KeyboardControlled);

      //doesn't need command, skip
      if(!controlComponent.state.needsInput) continue;

      //needs command but can't have it because no keys are pressed, stall
      if(controlComponent.state.needsInput && !wasAnyKeyReleased()){
        return true;
      }

      const commands = new Set<CommandType>();

      for(const [keyCode, command] of keyCodeCommandMap){
        if(wasKeyReleased(keyCode) && isValidKeyCode(keyCode) && hasEnoughEnergy(entity, command)){
          commands.add(command);
        }
      }

      if(!commands.size){
        //no valid commands, stall
        //TODO: log "unknown command"
        return true;
      }else{
        controlComponent.state.needsInput = false;
      }

      for(const command of commands){
        if(movementCommandDirectionMap.has(command) && entityManager.hasComponent(entity, ComponentType.Movement)){
          entityManager.getComponent(entity, ComponentType.Movement).state.direction = movementCommandDirectionMap.get(command);
        }
      }
    }

    return false;
  }

  public afterUpdate(){
    resetKeyboardInput();
  }
}
