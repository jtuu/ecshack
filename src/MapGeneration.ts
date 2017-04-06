import TileMap from "./TileMap";
import {ComponentType} from "./Enum";
import AssemblageData from "./ecs/AssemblageData/AssemblageData"
import TileAssemblageData from "./ecs/AssemblageData/Tile";
import {engine, entityManager} from "./EngineWorker";
import {MapFiles} from "./maps";
import {ComponentState} from "./ecs/Components/Component";
import {SpriteId} from "./Enum";

export namespace MapGen{

  interface MapData{
    name: string;
    tags: Array<string>;
    tileMap: TileMap;
    entryPos?: Coordinate;
  }

  const defaultMapData: MapData = {
    name: "default",
    tags: [],
    get tileMap() {
      return new TileMap();
    }
  };

  const newlinePattern = /\r\n|\n/g;

  const MapFileCharMap = new Map<string, [AssemblageData, boolean]>([
    ["#", [{
      [ComponentType.Wall]: {}
    }, false]],
    [".", [{
      [ComponentType.Floor]: {}
    }, false]],
    ["@", [{
      [ComponentType.Tile]: {isEntry: true}
    }, false]],
    ["*", [{
      [ComponentType.Flicker]: {},
      [ComponentType.Renderable]: {spriteId: SpriteId.FLICKER, layer: 1}
    }, true]]

  ]);
  const VOID_TILE = " ";

  function makeMapData(data: Partial<MapData>): MapData{
    return Object.assign({}, defaultMapData, data);
  }

  function parseMapDescription(mapDescription: string, mapData: Partial<MapData>): TileMap{
    const lines = mapDescription.split(newlinePattern);
    const height = lines.length;
    const width = lines[0].length;

    mapData.tileMap = new TileMap(width, height);

    //remove trailing newline
    if(!lines[lines.length - 1]){
      lines.pop();
    }
    if(height <= 0 || width <= 0 || lines.some(l => l.length !== width)){
      throw new SyntaxError("Invalid map size");
    }

    const trimmedMapDescription = mapDescription.replace(newlinePattern, "");
    const tileMap = new TileMap(width, height);
    for(let y = 0, i = 0; y < height; y++){
      for(let x = 0; x < width; x++, i++){
        const char = trimmedMapDescription[i];
        if(char === VOID_TILE || !MapFileCharMap.has(char)){
          tileMap.grid.delete(x, y);
          continue;
        }

        const tile = entityManager.createEntityFromAssemblage(TileAssemblageData);
        entityManager.addComponent(tile, ComponentType.Floor);
        entityManager.addComponent(tile, ComponentType.Renderable);

        const position = entityManager.getComponent(tile, ComponentType.ConstantPosition).state;
        position.x = x;
        position.y = y;
        tileMap.grid.set(x, y, tile);

        const [assemblage, isTileContent] = MapFileCharMap.get(char);
        if(isTileContent){
          const entity = entityManager.createEntityFromAssemblage(assemblage);
          mapData.tileMap.add(x, y, entity);
        }else{
          Reflect.ownKeys(assemblage).forEach(type => {
            entityManager.addComponent(tile, type, assemblage[type]);
          });
        }

        if(char === "@"){
          mapData.entryPos = {x, y}
        }
      }
    }

    return tileMap;
  }

  function parseMapFile(mapFile: string): MapData{
    const mapData: Partial<MapData> = {
      name: "test"
    };
    const lines = mapFile.split(newlinePattern);

    const nameDef = lines.find(line => /^NAME .+/.test(line));
    if(nameDef){
      mapData.name = nameDef.replace(/^NAME /, "");
    }

    const tagsDef = lines.find(line => /^TAGS .+/.test(line));
    if(tagsDef){
      mapData.tags = tagsDef.replace(/^TAGS /, "").split(/\s+/);
    }

    const mapDescriptionStart = lines.findIndex(line => /^MAP$/.test(line));
    const mapDescriptionEnd = lines.findIndex(line => /^ENDMAP$/.test(line));
    if(mapDescriptionStart > -1 && mapDescriptionEnd > 0 && mapDescriptionEnd > mapDescriptionStart){
      mapData.tileMap = parseMapDescription(lines.slice(mapDescriptionStart + 1, mapDescriptionEnd).join("\n"), mapData);
    }

    return makeMapData(mapData);
  }

  export namespace generate{
    export function testFloor(): MapData{
      return parseMapFile(MapFiles.test);
    }

    export function random(): MapData{
      const mapData: Partial<MapData> = {
        name: "random",
        tileMap: new TileMap(80, 24)
      };

      var entryPlaced = false;
      for(const [tile, idx, x, y] of mapData.tileMap.grid){
        entityManager.addComponent(tile, ComponentType.Floor);
        entityManager.addComponent(tile, ComponentType.Renderable);

        if(!engine.worldGenRng.random2(100)){
          entityManager.addComponent(tile, ComponentType.Wall);
        }else if(!entryPlaced && !engine.worldGenRng.random2(6)){
          mapData.entryPos = {x, y};
          entryPlaced = true;
        }
      }

      return makeMapData(mapData);
    }
  }

}
