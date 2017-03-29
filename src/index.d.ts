interface Coordinate{
  x: number;
  y: number;
}

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
}

declare module "*.des"{
  export const normalize: () => string;
}
