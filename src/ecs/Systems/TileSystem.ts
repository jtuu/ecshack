import System from "./System";
import {ComponentType, Direction} from "../../Enum";
import Entity from "../Entity";
import {engine, entityManager} from "../../EngineWorker";

export class TileSystem implements System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Tile];

  public update(entities: Iterable<Entity>){
    for(const entity of entities){
      const tileData = entityManager.getComponent(entity, ComponentType.Tile).state;

      if(entityManager.hasComponent(entity, ComponentType.Wall)){
        tileData.isBlocking = true;
      }else{
        tileData.isBlocking = false;
      }
    }
    return false;
  }
}
