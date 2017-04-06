import System from "./System";
import {ComponentType, Direction} from "../../Enum";
import Entity from "../Entity";
import {engine, entityManager} from "../../EngineWorker";

export class FlickerSystem implements System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Flicker];

  public update(entities: Iterable<Entity>){
    for(const entity of entities){
      const flicker = entityManager.getComponent(entity, ComponentType.Flicker).state;
      flicker.counter++;

      if(flicker.counter % flicker.rate === 0){
        flicker.alpha = engine.miscRng.random();
        flicker.counter = 0;

        if(entityManager.hasComponent(entity, ComponentType.Renderable)){
          const renderData = entityManager.getComponent(entity, ComponentType.Renderable).state;
          renderData.needsUpdate = true;
        }
      }
    }
    return false;
  }
}
