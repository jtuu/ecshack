import {Entity} from "./ecs/Entity";
import {Grid} from "./Grid";
import {entityManager} from "./EngineWorker";
import {TileAssemblageData} from "./ecs/AssemblageData/Tile";
import {ComponentType, TileOpacity} from "./Enum";
import {isEntity} from "./ecs/EntityUtils";
import {getPosition} from "./ecs/EntityUtils"

export class TileMap{
  public grid: Grid<Entity>;

  constructor(width: number = WORLD_MAX_X, height: number = WORLD_MAX_Y){
    this.grid = new Grid<Entity>(width, height);
    this.grid.initializeElements((i, x, y) => {
      const tile = entityManager.createEntityFromAssemblage(TileAssemblageData);
      const position = entityManager.getComponent(tile, ComponentType.ConstantPosition);
      position.state.x = x;
      position.state.y = y;
      return tile;
    });
  }

  public add(x: number, y: number, entity: Entity): void{
    const tile = this.grid.get(x, y);
    const contents = entityManager.getComponent(tile, ComponentType.Storage).state.contents;
    contents.add(entity);

    if(!entityManager.hasComponent(entity, ComponentType.TileReference)){
      entityManager.addComponent(entity, ComponentType.TileReference, {tile});
    }else{
      entityManager.getComponent(entity, ComponentType.TileReference).state.tile = tile;
    }
  }

  public remove(x: number, y: number, entity: Entity): void{
    const tile = this.grid.get(x, y);
    const contents = entityManager.getComponent(tile, ComponentType.Storage).state.contents;
    contents.delete(entity);

    if(entityManager.hasComponent(entity, ComponentType.TileReference)){
      entityManager.removeComponent(entity, ComponentType.TileReference);
    }
  }

  public clear(x: number, y: number): void{
    const tile = this.grid.get(x, y);
    if(!tile) return;
    const contents = entityManager.getComponent(tile, ComponentType.Storage).state.contents;

    for(const entity of contents){
      if(entityManager.hasComponent(entity, ComponentType.TileReference)){
        entityManager.removeComponent(entity, ComponentType.TileReference);
      }
      contents.delete(entity);
    }
  }

  public clearAll(): void{
    for(const [tile, x, y] of this.grid){
      this.clear(x, y);
    }
  }

  public getContents(x: number, y: number): Set<Entity>{
    const tile = this.grid.get(x, y);
    if(!isEntity(tile)) return null;

    return entityManager.getComponent(tile, ComponentType.Storage).state.contents;
  }

  public merge(otherMap: TileMap, ox: number = 0, oy: number = 0): void{
    for(const [tile, x, y] of otherMap.grid){
      if(!Number.isInteger(tile)) continue;

      this.clear(ox + x, oy + y);
      this.grid.set(x, y, tile);
      const newContents = <Set<Entity>>entityManager.getComponent(tile, ComponentType.Storage).state.contents;
      newContents.forEach(e => {
        this.add(ox + x, oy + y, e);
      });
    }
  }

  public getOpacity(x: number, y: number): TileOpacity{
    const tile = this.grid.get(x, y);
    if(isEntity(tile)){
      if(entityManager.hasComponent(tile, ComponentType.Wall)){
        return TileOpacity.OPAQUE;
      }

      /*
      const contents = <Set<Entity>>entityManager.getComponent(tile, ComponentType.Storage).state.contents;
      contents.forEach(entity => {

      });
      */
    }

    return TileOpacity.CLEAR;
  }
}
