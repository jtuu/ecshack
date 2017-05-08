import {System} from "./System";
import {ComponentType, FovTileState} from "../../Enum";
import {Entity} from "../Entity";
import {entityManager} from "../../EngineWorker";
import {getPosition} from "../EntityUtils";
import {VisionState} from "../Components/Vision";

export class VisionSystem extends System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Vision];

  public update(entities: Iterable<Entity>){
    for(const entity of entities){
      const vision = <VisionState>entityManager.getComponent(entity, ComponentType.Vision).state;
      const pos = getPosition(entity);
      if(!vision.fov.center || pos.x !== vision.fov.center.x || pos.y !== vision.fov.center.y){
        vision.fov.center = pos;
      }
    }
    return false;
  }
}
