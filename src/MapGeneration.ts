import TileMap from "./TileMap";
import {ComponentType} from "./Enum";
import TileAssemblageData from "./ecs/AssemblageData/Tile";
import {entityManager} from "./EngineWorker";
import {MapFiles} from "./maps";
import {ComponentState} from "./ecs/Components/Component";

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

  const MapFileCharMap = new Map<string, [ComponentType, ComponentState]>([
    ["#", [ComponentType.Wall, {}]],
    [".", [ComponentType.Floor, {}]],
    ["@", [ComponentType.Tile, {isEntry: true}]]
  ]);
  const VOID_TILE = " ";

  function makeMapData(data: Partial<MapData>): MapData{
    return Object.assign({}, defaultMapData, data);
  }

  function parseMapDescription(mapDescription: string, mapData: Partial<MapData>): TileMap{
    const lines = mapDescription.split(newlinePattern);
    const height = lines.length;
    const width = lines[0].length;

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
        const componentCreationData = MapFileCharMap.get(char);
        entityManager.addComponent(tile, componentCreationData[0], componentCreationData[1]);
        tileMap.grid.set(x, y, tile);
        if(char === "@"){
          mapData.entryPos = {x, y}
        }
      }
    }

    return tileMap;
  }

  function parseMapFile(mapFile: string): MapData{
    const mapData: Partial<MapData> = {};
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
  }

}
