import {MersenneTwister} from "../lib/mersenne-twister";

export class Rng extends MersenneTwister{
  public static readonly max: number = 0xffffffff;
  private _seed: number;

  constructor(seed?: number){
    if(seed === undefined){
      seed = Date.now();
    }
    super(seed);
    this._seed = seed;
  }

  public get seed(){
    return this._seed;
  }

  public random2(max: number = 0): number{
    max = max | 0;

    if (max <= 1) return 0;

    const partn = Rng.max / max;

    while(true){
      const bits = this.genrand_int32();
      const val = bits / partn;

      if(val < max) return val | 0;
    }
  }

  public coinflip(): boolean{
    return !!this.random2(2);
  }

  public pick<T>(arr: ArrayLike<T>): T{
    return arr[this.genrand_int32() % (arr.length - 1)];
  }
}
