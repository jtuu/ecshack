import Entity from "./Entity";
import {entityManager} from "../EngineWorker";
import {ComponentType, SpriteId} from "../Enum";

export namespace EntityUtils{

}
export function getSpriteId(entity: Entity): SpriteId{
  return entityManager.hasComponent(entity, ComponentType.Renderable) ?
    entityManager.getComponent(entity, ComponentType.Renderable).state.spriteId :
    SpriteId.VOID;
}

export function getPosition(entity: Entity): Coordinate{
  if(entityManager.hasComponent(entity, ComponentType.TileReference)){
    return entityManager.getComponent(entityManager.getComponent(entity, ComponentType.TileReference).state.tile, ComponentType.ConstantPosition).state;
  }
  if(entityManager.hasComponent(entity, ComponentType.ConstantPosition)){
    return entityManager.getComponent(entity, ComponentType.ConstantPosition).state;
  }
  return {x: 0, y: 0};
}

export function getLayer(entity: Entity): number{
  return entityManager.hasComponent(entity, ComponentType.Renderable) ?
    entityManager.getComponent(entity, ComponentType.Renderable).state.layer :
    0;
}

export function getAlpha(entity: Entity): number{
  return entityManager.hasComponent(entity, ComponentType.Flicker) ?
    1 - entityManager.getComponent(entity, ComponentType.Flicker).state.alpha / 3 :
    1;
}

export const isEntity = (entity: Entity) => Number.isInteger(entity);
