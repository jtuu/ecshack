import {engine, entityManager} from "./EngineWorker";
import {Grid, GridIteratorReturn} from "./Grid";
import {GeometryUtils} from "./Utils";
import {ComponentType} from "./Enum";

const {encodeCoordinate} = GeometryUtils;

export namespace Pathfinding{

  class DjikstraMap extends Grid<number>{
    private static readonly MAX_VALUE: number = Number.MAX_SAFE_INTEGER;
    public targets: Array<Coordinate> = [];
    public static cache: Set<DjikstraMap> = new Set();

    constructor(){
      super(WORLD_MAX_X, WORLD_MAX_Y, DjikstraMap.MAX_VALUE);
    }

    public indexOfTarget(target: Coordinate): number{
      for(let i = 0; i < this.targets.length; i++){
        const {x, y} = this.targets[i];
        if(x === target.x && y === target.y) return i;
      }
      return -1;
    }

    public hasTarget(target: Coordinate): boolean{
      return this.indexOfTarget(target) > -1;
    }

    public addTarget(target: Coordinate): void{
      if(!this.hasTarget(target)){
        this.targets.push(target);
      }
    }

    public removeTarget(target: Coordinate): void{
      const idx = this.indexOfTarget(target);
      if(idx > -1){
        this.targets.splice(idx, 1);
      }
    }

    public update(maxIter: number = 100): void{
      this.elements.fill(DjikstraMap.MAX_VALUE);
      for(const {x, y} of this.targets){
        this.set(x, y, 0);
      }

      var done = false, iter = 0;
      while(!done && iter++ < maxIter){
        done = true;

        for(const [tile, x, y] of engine.scene.map.grid){
          const tileData = entityManager.getComponent(tile, ComponentType.Tile).state;
        }
      }
    }

    public *path(x: number, y: number): Pathfinding.Path{
      var current: GridIteratorReturn<number> = [this.get(x, y), x, y];

      while(true){
        const next: GridIteratorReturn<number> = Array.from(this.neighbors(current[1], current[2], 1, true))
          .concat(Array.from(this.neighbors(current[1], current[2], 1, false)))
          .sort((a, b) => a[0] - b[0])[0];

        if(next && next.length && next[0] < current[0]){
          current = next;
          yield current;
        }else{
          break;
        }
      }
    }
  }

  export type Path = IterableIterator<GridIteratorReturn<number>>;

  function findCached(targets: Array<Coordinate>): DjikstraMap{
    for(const map of DjikstraMap.cache){
      if(targets.every(t => map.hasTarget(t))) return map;
    }
  }

  function createDjikstraMap(targets: Array<Coordinate>): DjikstraMap{
    const map = new DjikstraMap();

    for(const target of targets){
      map.addTarget(target);
    }

    map.update();

    return map;
  }

  export function clearCache(){
    DjikstraMap.cache.clear();
  }

  export function* getPath(from: Coordinate, targets: Coordinate | Array<Coordinate>): Path{
    //XXX: special logic if only one target?
    if(!Array.isArray(targets)){
      targets = [targets];
    }

    const map = findCached(targets) || createDjikstraMap(targets);

    var current: GridIteratorReturn<number> = [map.get(from.x, from.y), from.x, from.y];
    while(true){
      const next = Array.from(map.neighbors(current[1], current[2], 1, true))
        .concat(Array.from(map.neighbors(current[1], current[2], 1, false)))
        .sort((a, b) => a[0] - b[0])[0];
      if(next && next.length && next[0] < current[0]){
        current = next;
        yield current;
      }else{
        break;
      }
    }
  }
}
