import {System} from "./System";
import {ComponentType, Direction} from "../../Enum";
import {Entity} from "../Entity";
import {engine, entityManager} from "../../EngineWorker";
import {isEntity} from "../EntityUtils";

const movementVectors = new Map([
  [Direction.UP, [0, -1]],
  [Direction.RIGHT, [1, 0]],
  [Direction.DOWN, [0, 1]],
  [Direction.LEFT, [-1, 0]],
  [Direction.UP_RIGHT, [1, -1]],
  [Direction.UP_LEFT, [-1, -1]],
  [Direction.DOWN_RIGHT, [1, 1]],
  [Direction.DOWN_LEFT, [-1, 1]]
]);

const movementEnergyCost = 100; //XXX

export class MovementSystem extends System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Movement, ComponentType.TileReference];

  public update(entities: Iterable<Entity>){
    for(const entity of entities){
      const movement = entityManager.getComponent(entity, ComponentType.Movement).state;
      if(!movementVectors.has(movement.direction)) continue;

      const vec = movementVectors.get(movement.direction);
      const currentPos = <Coordinate>entityManager.getComponent(entityManager.getComponent(entity, ComponentType.TileReference).state.tile, ComponentType.ConstantPosition).state;
      const targetPos: Coordinate = {x: currentPos.x + vec[0], y: currentPos.y + vec[1]};

      if(engine.scene.canMoveTo(entity, targetPos.x, targetPos.y)){
        if(entityManager.hasComponent(entity, ComponentType.Energy)){
          entityManager.getComponent(entity, ComponentType.Energy).state.value -= movementEnergyCost; //XXX
        }
        engine.scene.moveEntity(entity, vec[0], vec[1]);
      }
  
      movement.direction = null;
    }
    return false;
  }
}
