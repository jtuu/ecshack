import {System} from "./System";
import {ComponentType, Direction} from "../../Enum";
import {Entity} from "../Entity";
import {engine, entityManager} from "../../EngineWorker";

export class SimpleWalkerSystem extends System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.AIControlled, ComponentType.SimpleWalker, ComponentType.Movement];

  public update(entities: Iterable<Entity>): boolean{
    for(const entity of entities){
      const controller = entityManager.getComponent(entity, ComponentType.AIControlled).state;
      if(controller.needsInput){
        const movement = entityManager.getComponent(entity, ComponentType.Movement).state;
        movement.direction = Direction.DOWN;
        controller.needsInput = false;
      }
    }

    return false;
  }
}
