import Grid from "./Grid";
import {FovTileState, TileOpacity} from "./Enum";
import Entity from "./ecs/Entity";
import {engine} from "./EngineWorker";
import {isEntity} from "./ecs/EntityUtils";
import {GeometryUtils} from "./Utils";

interface FovDiffResult{
  a: Array<Entity>;
  b: Array<Entity>;
}

export class Fov{
  public tileRefMap: Grid<Entity>;
  public visibilityMap: Grid<FovTileState>;
  private _diameter: number;
  private _radius: number;
  private _center: Coordinate;
  private needsUpdate: boolean = true;

  private static readonly cache = {
    enabled: true,
    grid: new Grid<Fov>(WORLD_MAX_X, WORLD_MAX_Y),
    size: 10,
    age: new Array<Fov>()
  }

  constructor(radius: number = FOV_MAX_RADIUS, center?: Coordinate){
    this.radius = radius;
    const maxDiameter = FOV_MAX_RADIUS * 2 + 1;
    this.tileRefMap = new Grid<Entity>(maxDiameter, maxDiameter, null);
    this.visibilityMap = new Grid<FovTileState>(maxDiameter, maxDiameter, FovTileState.NOT_VISIBLE);
    if(center){
      this.center = center;
      if(Fov.cache.enabled){
        const cached = Fov.cache.grid.getByXy(center.x, center.y);
        cached.radius = radius;
        return cached;
      }
    }
  }

  public set radius(value: number){
    this._radius = value < FOV_MAX_RADIUS ? (value > 0 ? value : 0) : FOV_MAX_RADIUS;
    this._diameter = this.radius * 2 + 1;
  }

  public get radius(){
    return this._radius;
  }

  public set diameter(value: number){
    this.radius = (value + 1) / 2 | 0;
  }

  public get diameter(){
    return this._diameter;
  }

  public set center(value: Coordinate){
    this._center = value;

    if(Fov.cache.enabled){
      if(Fov.cache.age.length > Fov.cache.size){
        const old = Fov.cache.age.pop();
        Fov.cache.grid.delete(old.center.x, old.center.y);
      }

      if(!Fov.cache.grid.getByXy(this.center.x, this.center.y)){
        const clone = this.clone();
        Fov.cache.grid.set(this.center.x, this.center.y, clone);
        Fov.cache.age.push(clone);
      }
    }
  }

  public get center(){
    return this._center;
  }

  public clone(): Fov{
    const clone = new Fov(this.radius);
    clone._center = this.center;
    clone.tileRefMap = this.tileRefMap.clone();
    clone.visibilityMap = this.tileRefMap.clone();
    return clone;
  }

  public globalToLocal(coord: Coordinate): Coordinate{
    const ox = this.center.x - this.radius, oy = this.center.y - this.radius;
    return {x: coord.x - ox, y: coord.y - oy};
  }

  private mrpasQuadrant(dx: number, dy: number){

    const startAngle: Array<number> = [];
    startAngle[99] = undefined;
    const endAngle = startAngle.slice(0);
    const {width, height} = GeometryUtils.worldBounds;

    var iter = 1,
      done = false,
      totalObstacles = 0,
      obstaclesInLastLine = 0,
      minAngle = 0.0,
      x = 0.0,
      y = this.center.y + dy;

    var slopesPerCell,
      halfSlopes,
      processedCell,
      minx,
      maxx,
      miny,
      maxy,
      pos,
      visible,
      startSlope,
      centerSlope,
      endSlope,
      idx;

    if(y < 0 || y >= height) done = true;

    while(!done){
      slopesPerCell = 1.0 / (iter + 1);
      halfSlopes = slopesPerCell * 0.5;
      processedCell = minAngle / slopesPerCell | 0;
      minx = Math.max(0, this.center.x - iter);
      maxx = Math.min(width - 1, this.center.x + iter);
      done = true;
      x = this.center.x + processedCell * dx;

      while(x >= minx && x <= maxx){
        pos = {x, y};
        visible = true;
        startSlope = processedCell * slopesPerCell;
        centerSlope = startSlope + halfSlopes;
        endSlope = startSlope + slopesPerCell;

        if(obstaclesInLastLine > 0 && !this.canSee(this.globalToLocal(pos))){
          idx = 0;
          while(visible && idx < obstaclesInLastLine){
            if(
              engine.scene.map.getOpacity(pos.x, pos.y) < TileOpacity.OPAQUE
            ){
              if(
                centerSlope > startAngle[idx] &&
                centerSlope < endAngle[idx]
              ){
                visible = false;
              }
            }else if(
              startSlope >= startAngle[idx] &&
              endSlope <= endAngle[idx]
            ){
              visible = false;
            }

            if(
              visible && (
                !this.canSee(this.globalToLocal({x, y: y - dy})) ||
                engine.scene.map.getOpacity(x, y - dy) === TileOpacity.OPAQUE
              ) && (
                x - dx >= 0 &&
                x - dx < width && (
                  !this.canSee(this.globalToLocal({x: x - dx, y: y - dy})) ||
                  engine.scene.map.getOpacity(x - dx, y - dy) === TileOpacity.OPAQUE
                )
              )
            ){
              visible = false;
            }

            idx++;
          }
        }

        if(visible){
          const l = this.globalToLocal(pos);
          this.tileRefMap.set(l.x, l.y, engine.scene.map.grid.getByXy(pos.x, pos.y));
          this.visibilityMap.set(l.x, l.y, FovTileState.VISIBLE);
          done = false;

          if(engine.scene.map.getOpacity(pos.x, pos.y) === TileOpacity.OPAQUE){
            if(minAngle >= startSlope){
              minAngle = endSlope;
            }else{
              startAngle[totalObstacles] = startSlope;
              endAngle[totalObstacles] = endSlope;
              totalObstacles++;
            }
          }
        }

        processedCell++;
        x += dx;
      }

      if(iter === this.radius) done = true;
      iter++;
      obstaclesInLastLine = totalObstacles;
      y += dy;
      if(y < 0 || y >= height) done = true;
      if(minAngle === 1.0) done = true;
    }

    iter = 1;
    done = false;
    totalObstacles = 0;
    obstaclesInLastLine = 0;
    minAngle = 0.0;
    x = this.center.x + dx;
    y = 0;

    if(x < 0 || x >= width) done = true;

    while(!done){
      slopesPerCell = 1.0 / (iter + 1);
      halfSlopes = slopesPerCell * 0.5;
      processedCell = minAngle / slopesPerCell | 0;
      miny = Math.max(0, this.center.y - iter);
      maxy = Math.min(height - 1, this.center.y + iter);
      done = true;
      y = this.center.y + processedCell * dy;

      while(y >= miny && y <= maxy){
        pos = {x, y};
        visible = true;
        startSlope = processedCell * slopesPerCell;
        centerSlope = startSlope + halfSlopes;
        endSlope = startSlope + slopesPerCell;

        if(obstaclesInLastLine > 0 && !this.canSee(this.globalToLocal(pos))){
          idx = 0;

          while(visible && idx < obstaclesInLastLine){
            if(engine.scene.map.getOpacity(pos.x, pos.y) < TileOpacity.OPAQUE){
              if(centerSlope > startAngle[idx] && centerSlope < endAngle[idx]){
                visible = false;
              }
            }else if(startSlope >= startAngle[idx] && endSlope <= endAngle[idx]){
              visible = false;
            }

            if(
              visible && (
                !this.canSee(this.globalToLocal({x: x - dx, y})) ||
                engine.scene.map.getOpacity(x - dx, y) === TileOpacity.OPAQUE
              ) && (
                y - dy >= 0 &&
                y - dy < height && (
                  !this.canSee(this.globalToLocal({x: x - dx, y: y - dy})) ||
                  engine.scene.map.getOpacity(x - dx, y - dy) === TileOpacity.OPAQUE
                )
              )
            ){
              visible = false;
            }

            idx++;
          }
        }

        if(visible){
          const l = this.globalToLocal(pos);
          this.tileRefMap.set(l.x, l.y, engine.scene.map.grid.getByXy(pos.x, pos.y));
          this.visibilityMap.set(l.x, l.y, FovTileState.VISIBLE);
          done = false;

          if(engine.scene.map.getOpacity(pos.x, pos.y) === TileOpacity.OPAQUE){
            if(minAngle >= startSlope){
              minAngle = endSlope;
            }else{
              startAngle[totalObstacles] = startSlope;
              endAngle[totalObstacles] = endSlope;
              totalObstacles++;
            }
          }
        }

        processedCell++;
        y += dy;
      }

      if(iter === this.radius) done = true;
      iter++;
      obstaclesInLastLine = totalObstacles;
      x += dx;
      if(x < 0 || x >= width) done = true;
      if(minAngle === 1.0) done = true;
    }
  }

  private update(): void{
    this.needsUpdate = false;
    this.tileRefMap.fill(null);
    this.visibilityMap.fill(FovTileState.NOT_VISIBLE);

    const l = this.globalToLocal(this.center);
    this.visibilityMap.set(l.x, l.y, FovTileState.VISIBLE);

    this.mrpasQuadrant(1, 1);
    this.mrpasQuadrant(1, -1);
    this.mrpasQuadrant(-1, 1);
    this.mrpasQuadrant(-1, -1);
  }

  public *[Symbol.iterator](): IterableIterator<[Entity, FovTileState, number, number]>{
    if(this.needsUpdate){
      this.update();
    }

    const c = this.center;

    yield [this.tileRefMap.getByXy(c.x, c.y), this.visibilityMap.getByXy(c.x, c.y), c.x, c.y];

    for(let r = 1; r <= this.radius; r++){
      for(let i = -r; i < r; i++){
        const xN = c.x + i, yN = c.y - r;
        if(GeometryUtils.isInWorld({x: xN, y: yN}))
          yield [this.tileRefMap.getByXy(xN, yN), this.visibilityMap.getByXy(xN, yN), xN, yN];

        const xE = c.x + r, yE = c.y + i;
        if(GeometryUtils.isInWorld({x: xE, y: yE}))
          yield [this.tileRefMap.getByXy(xE, yE), this.visibilityMap.getByXy(xE, yE), xE, yE];

        const xS = c.x - i, yS = c.y + r;
        if(GeometryUtils.isInWorld({x: xS, y: yS}))
          yield [this.tileRefMap.getByXy(xS, yS), this.visibilityMap.getByXy(xS, yS), xS, yS];

        const xW = c.x - r, yW = c.y - i;
        if(GeometryUtils.isInWorld({x: xW, y: yW}))
          yield [this.tileRefMap.getByXy(xW, yW), this.visibilityMap.getByXy(xW, yW), xW, yW];
      }
    }
  }

  public invalidate(): void{
    this.needsUpdate = true;
  }

  public canSee(x: number | Coordinate, y?: number): boolean{
    if(typeof x === "object"){
      y = x.y;
      x = x.x;
    }

    if(this.needsUpdate){
      this.update();
    }

    return this.visibilityMap.getByXy(x, y) === FovTileState.VISIBLE;
  }

  public static diff(a: Fov, b: Fov): FovDiffResult{
    const result: FovDiffResult = {a: [], b: []};

    if(a.needsUpdate) a.update();
    if(b.needsUpdate) b.update();

    const actile = a.tileRefMap.getByXy(a.center.x, a.center.y);
    const bctile = b.tileRefMap.getByXy(b.center.x, b.center.y);

    for(const [tile, idx, x, y] of a.tileRefMap){
      if(isEntity(tile) && !b.tileRefMap.has(tile)){
        result.a.push(tile);
      }
    }

    for(const [tile, idx, x, y] of b.tileRefMap){
      if(isEntity(tile) && !a.tileRefMap.has(tile)){
        result.b.push(tile);
      }
    }

    return result;
  }
}
