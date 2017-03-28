export default class Grid<T>{
  private readonly elements: Array<T>;
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

  public getByXy(x: number, y: number): T{
    return this.elements[y * this.width + x];
  }

  public getByIndex(index: number): T{
    return this.elements[index];
  }

  public set(x: number, y: number, value: T): void{
    this.elements[y * this.width + x] = value;
  }

  public delete(x: number, y: number): void{
    delete this.elements[y * this.width + x];
  }

  public *[Symbol.iterator](): IterableIterator<[T, number, number, number]>{
    const {width, height} = this;
    for(let y = 0, i = 0; y < height; y++){
      for(let x = 0; x < width; x++, i++){
        yield [this.elements[i], i, x, y];
      }
    }
  }
}
