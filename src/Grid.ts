export type GridIteratorReturn<T> = [T, number, number];

export class Grid<T> implements Iterable<GridIteratorReturn<T>>{
  protected elements: Array<T>;
  public readonly width: number;
  public readonly height: number;
  public readonly size: number;

  constructor(width: number, height: number, initValue?: T){
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.elements = Array(width * height).fill(initValue);
  }

  public initializeElements(callback: (index: number, x: number, y: number,  element: T) => any){
    for(let i = 0; i < this.elements.length; i++){
      const x = i % this.width;
      const y = i / this.width | 0;
      this.elements[i] = callback(i, x, y, this.elements[i]);
    }
  }

  public get(x: number, y: number): T{
    return this.elements[y * this.width + x];
  }

  public set(x: number, y: number, value: T): void{
    this.elements[y * this.width + x] = value;
  }

  public delete(x: number, y: number): void{
    this.elements[y * this.width + x] = undefined;
  }

  public *column(column: number): IterableIterator<GridIteratorReturn<T>>{
    const {width, height, elements} = this;
    for(let y = 0; y < height; y++){
      const i = y * width + column;
      yield [elements[i], column, y];
    }
  }

  public *columns(): IterableIterator<IterableIterator<GridIteratorReturn<T>>>{
    for(let x = 0; x < this.width; x++){
      yield this.column(x);
    }
  }

  public *row(row: number): IterableIterator<GridIteratorReturn<T>>{
    const {width, height, elements} = this;
    for(let x = 0; x < width; x++){
      const i = row * width + x;
      yield [elements[i], x, row];
    }
  }

  public *rows(): IterableIterator<IterableIterator<GridIteratorReturn<T>>>{
    for(let y = 0; y < this.height; y++){
      yield this.row(y);
    }
  }

  public *neighbors(x: number, y: number, radius: number = 1, cardinalOnly: boolean = false): IterableIterator<GridIteratorReturn<T>>{
    if(cardinalOnly){
      for(let r = 1; r <= radius; r++){
        const xN = x, yN = y - r;
        yield [this.get(xN, yN), xN, yN];

        const xE = x + r, yE = y;
        yield [this.get(xE, yE), xE, yE];

        const xS = x, yS = y + r;
        yield [this.get(xS, yS), xS, yS];

        const xW = x - r, yW = y;
        yield [this.get(xW, yW), xW, yW];
      }
    }else{
      for(let r = 1; r <= radius; r++){
        for(let i = -r; i < r; i++){
          const xN = x + i, yN = y - r;
          yield [this.get(xN, yN), xN, yN];

          const xE = x + r, yE = y + i;
          yield [this.get(xE, yE), xE, yE];

          const xS = x - i, yS = y + r;
          yield [this.get(xS, yS), xS, yS];
  
          const xW = x - r, yW = y - i;
          yield [this.get(xW, yW), xW, yW];
        }
      }
    }
  }

  public *[Symbol.iterator](): IterableIterator<GridIteratorReturn<T>>{
    const {width, height, elements} = this;
    for(let y = 0, i = 0; y < height; y++){
      for(let x = 0; x < width; x++, i++){
        yield [elements[i], x, y];
      }
    }
  }

  public clone(): Grid<T>{
    const clone = new Grid<T>(this.width, this.height);
    clone.elements = this.elements.slice(0);
    return clone;
  }

  public fill(value: T): void{
    this.elements.fill(value);
  }

  public has(value: T): boolean{
    return this.elements.indexOf(value) > -1;
  }
}
