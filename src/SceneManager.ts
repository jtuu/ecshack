import TileMap from "./TileMap";
import Entity from "./ecs/Entity";
import {entityManager} from "./EngineWorker";
import {ComponentType} from "./Enum";
import {moveEntity, setState, dispatch} from "./UIState";
import {MapGen} from "./MapGeneration";
import PlayerAssemblageData from "./ecs/AssemblageData/Player";

export default class SceneManager{
  public map: TileMap;

  constructor(){
    this.map = new TileMap();
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

    dispatch(moveEntity(entity, newPos));
  }

  public initNewGame(): void{
    const testFloor = MapGen.generate.testFloor();
    const player = entityManager.createEntityFromAssemblage(PlayerAssemblageData);
    testFloor.tileMap.add(testFloor.entryPos.x, testFloor.entryPos.y, player);
    this.map.clearAll();
    this.map.merge(testFloor.tileMap);
    dispatch(setState(this.map));
  }
}
