import EntityManager from "./ecs/EntityManager";

interface GameState{}

export default class Game{
  private playing: boolean = false;

  constructor(){}

  private step(): GameState{
    return {};
  }

  public *run(): GameState{
    this.playing = true;

    while(this.playing){
      yield this.step();
    }
  }

  public stop(): void{
    this.playing = false;
  }
}
