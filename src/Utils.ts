import * as TextEncoding from "text-encoding";

export namespace StringUtils{
  const textEncoder = new TextEncoder();

  export function getBytes(str: string): Uint8Array{
    return textEncoder.encode(str);
  }

  export function hash(str: string): number{
    var hash = 5381;

    for(const byte of getBytes(str)){
      hash = (hash * 33) ^ byte;
    }

    return hash >>> 0;
  }
}

export namespace NumberUtils{

  export function encodePair(x: number, y: number): number{
    if(x === Math.max(x, y)){
      return x ** 2 + x + y;
    }else{
      return y ** 2 + x;
    }
  }

  export function decodePair(z: number): [number, number]{
    const a = Math.sqrt(z) | 0;
    const b = z - a ** 2;
    if(b < a){
      return [b, a];
    }else{
      return [a, b - a];
    }
  }
}

export namespace GeometryUtils{

  export function pointIntersect(rect: Rectangle, coord: Coordinate): boolean{
    if(coord.x >= rect.point.x &&
      coord.y >= rect.point.y &&
      coord.x <= rect.point.x + rect.width &&
      coord.y <= rect.point.y + rect.height){
      return true;
    }
    return false;
  }

  export const worldBounds: Rectangle = {
    point: {
      x: 0,
      y: 0,
    },
    width: WORLD_MAX_X,
    height: WORLD_MAX_Y
  };

  export function isInWorld(coord: Coordinate): boolean{
    return pointIntersect(worldBounds, coord);
  }

  export function clampToWorld(coord: Coordinate): Coordinate{
    if(coord.x < 0) coord.x = 0;
    if(coord.x > WORLD_MAX_X) coord.x = WORLD_MAX_X;
    if(coord.y < 0) coord.y = 0;
    if(coord.y > WORLD_MAX_Y) coord.y = WORLD_MAX_Y;
    return coord;
  }

  export function encodeCoordinate(coord: Coordinate): number{
    return NumberUtils.encodePair(coord.x, coord.y);
  }

  export function decodeCoordinate(code: number): Coordinate{
    const [x, y] = NumberUtils.decodePair(code);
    return {x, y};
  }
}
