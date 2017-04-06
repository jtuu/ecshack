interface Coordinate{
  x: number;
  y: number;
}

interface Rectangle{
  point: Coordinate;
  width: number;
  height: number;
}

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
}

declare module "*.des"{
  export const normalize: () => string;
}

declare const WORLD_MAX_X: number;
declare const WORLD_MAX_Y: number;

declare const WORLDGEN_NAME_MAX_LENGTH: number;

declare const FOV_MAX_RADIUS: number

declare const TILE_BASE_SIZE: number;
declare const TILE_SIZE: number;
declare const TILE_SCALE: number;

declare const SCREEN_TILE_X: number;
declare const SCREEN_TILE_Y: number;
declare const SCREEN_WIDTH: number;
declare const SCREEN_HEIGHT: number;
