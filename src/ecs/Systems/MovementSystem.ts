import System from "./System";
import {ComponentType, Direction} from "../../Enum";
import Entity from "../Entity";
import {engine, entityManager} from "../../EngineWorker";

const movementVectors = {
  [Direction.UP]: [0, -1],
  [Direction.RIGHT]: [1, 0],
  [Direction.DOWN]: [0, 1],
  [Direction.LEFT]: [-1, 0],
  [Direction.UP_RIGHT]: [1, -1],
  [Direction.UP_LEFT]: [-1, -1],
  [Direction.DOWN_RIGHT]: [1, 1],
  [Direction.DOWN_LEFT]: [-1, 1]
};

export class MovementSystem implements System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Movement, ComponentType.TileReference];

  public update(entities: Iterable<Entity>){
    for(const entity of entities){
      const movement = entityManager.getComponent(entity, ComponentType.Movement).state;
      if(!movementVectors.hasOwnProperty(movement.direction)) continue;

      const vec = movementVectors[movement.direction];
      const oTile = entityManager.getComponent(entity, ComponentType.TileReference);
      const oPos = entityManager.getComponent(oTile.state.tile, ComponentType.ConstantPosition).state;
      const targetTile = engine.scene.map.grid.getByXy(oPos.x + vec[0], oPos.y + vec[1]);

      if(Number.isInteger(targetTile)){
        const tileData = entityManager.getComponent(targetTile, ComponentType.Tile).state;
        if(!tileData.isBlocking && entityManager.hasComponent(targetTile, ComponentType.Floor)){
          engine.scene.moveEntity(entity, vec[0], vec[1]);
        }
      }
      movement.direction = null;
    }
    return false;
  }
}
