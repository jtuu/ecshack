import {System} from "./System";
import {ComponentType, SpriteId} from "../../Enum";
import {Entity} from "../Entity";
import {entityManager} from "../../EngineWorker";
import {dispatch, updateEntity} from "../../UIState";

const tileSize = 32;

function pickSprite(entity: Entity): SpriteId{
  var sprite = SpriteId.MISSING;

  if(entityManager.hasComponent(entity, ComponentType.Floor)){
    sprite = SpriteId.FLOOR_DEFAULT;
  }
  if(entityManager.hasComponent(entity, ComponentType.Wall)){
    return SpriteId.WALL_STONE;
  }

  return sprite;
}

export class RenderSystem extends System{
  public readonly subscribedComponents: Array<ComponentType> = [ComponentType.Renderable];

  public update(entities: Iterable<Entity>): boolean{
    for(const entity of entities){
      const renderData = entityManager.getComponent(entity, ComponentType.Renderable);

      /*
      if(entityManager.hasComponent(entity, ComponentType.TileReference)){
        const pos = entityManager.getComponent(entityManager.getComponent(entity, ComponentType.TileReference).state.tile, ComponentType.ConstantPosition);
        renderData.state.screenX = pos.state.x * tileSize;
        renderData.state.screenY = pos.state.y * tileSize;
        renderData.state.needsUpdate = true;
      }
      */

      if(!Number.isInteger(renderData.state.spriteId)){
        renderData.state.spriteId = pickSprite(entity);
        renderData.state.needsUpdate = true;
      }

      if(renderData.state.needsUpdate){
        dispatch(updateEntity(entity));
        renderData.state.needsUpdate = false;
      }
    }
    return false;
  }
}
