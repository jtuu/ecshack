import TileMap from "./TileMap";
import Entity from "./ecs/Entity";
import {engine, entityManager} from "./EngineWorker";
import {ComponentType} from "./Enum";
import {moveEntity, setState, dispatch} from "./UIState";
import {MapGen} from "./MapGeneration";
import PlayerAssemblageData from "./ecs/AssemblageData/Player";
import {Fov} from "./Fov";

export default class SceneManager{
  public map: TileMap;

  constructor(){
    this.map = new TileMap();
  }

  public invalidateFov(center: Coordinate): void{
    const fov = new Fov();
    fov.center = center;

    for(const [tile, visibility, x, y] of fov){
      const tileContents = this.map.getContents(x, y);
      if(tileContents){
        tileContents.forEach(entity => {
          if(entityManager.hasComponent(entity, ComponentType.Vision)){
            const vision = entityManager.getComponent(entity, ComponentType.Vision).state;
            vision.fov.invalidate();
          }
        });
      }
    }
  }

  public moveEntity(entity: Entity, dx: number, dy: number): void{
    const oTile = entityManager.getComponent(entity, ComponentType.TileReference);
    const oPos = entityManager.getComponent(oTile.state.tile, ComponentType.ConstantPosition).state;
    const oTileContents = entityManager.getComponent(oTile.state.tile, ComponentType.Storage).state.contents;

    oTileContents.delete(entity);

    const newPos = {x: oPos.x + dx, y: oPos.y + dy};
    const newTile = this.map.grid.getByXy(newPos.x, newPos. y);
    oTile.state.tile = newTile;

    const newTileContents = entityManager.getComponent(newTile, ComponentType.Storage).state.contents;
    newTileContents.add(entity);

    this.invalidateFov(newPos);

    dispatch(moveEntity(entity, newPos));
  }

  public initNewGame(): void{
    const testFloor = MapGen.generate.testFloor();
    const player = entityManager.createEntityFromAssemblage(PlayerAssemblageData);
    testFloor.tileMap.add(testFloor.entryPos.x, testFloor.entryPos.y, player);
    this.map.clearAll();
    this.map.merge(testFloor.tileMap);
    engine.warmUpSystems();
    dispatch(setState(this.map));
  }
}
