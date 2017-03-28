import EntityManager from "./ecs/EntityManager";
import System from  "./ecs/Systems/System";
import * as Systems from "./ecs/Systems";
import SceneManager from "./SceneManager";
import Rng from "./Random";
import Entity from "./ecs/Entity";
import {store as UI, UIState, endStep, UIMapPart, dispatch, EntityRenderData} from "./UIState";
import {Memoize} from "./Decorators";

export interface EngineConfig{
  worldGenSeed?: number;
  miscSeed?: number;
}

export interface StepReturn{
  ui: RecursivePartial<{
    map: {
      entityData: EntityRenderData;
      activeEntities: Array<Entity>;
    }
  }>
}

const defaultEngineConfig: EngineConfig = {

}

export class Engine{
  private playing: boolean = false;
  public entityManager: EntityManager;
  private concreteSystems: Array<System>;
  private cosmeticSystems: Array<System>;
  public worldGenRng: Rng;
  public miscRng: Rng;
  private systemComponentSubscriptions: Map<System, Set<Entity>> = new Map();

  constructor(config: EngineConfig = defaultEngineConfig){
    this.worldGenRng = new Rng(config.worldGenSeed);
    this.miscRng = new Rng(config.miscSeed);

    this.entityManager = new EntityManager();

    this.concreteSystems = [
      new Systems.RenderSystem(),
      new Systems.KeyboardControlSystem(),
      new Systems.TileSystem(),
      new Systems.MovementSystem()
    ];
    this.cosmeticSystems = [

    ];
    this.concreteSystems.concat(this.cosmeticSystems).forEach(system => {
      const subscriber = new Set();
      this.systemComponentSubscriptions.set(system, subscriber);
      this.entityManager.subscribeToComponents(subscriber, system.subscribedComponents);
    });

  }

  @Memoize
  public get scene(): SceneManager{
    return new SceneManager();
  }

  private runSystems(){
    var isBlockingAnimation = false;
    for(const system of this.cosmeticSystems){
      isBlockingAnimation = system.update(this.systemComponentSubscriptions.get(system));
    }

    if(!isBlockingAnimation){
      for(const system of this.concreteSystems){
        const shouldStall = system.update(this.systemComponentSubscriptions.get(system));
        if(shouldStall){
          break;
        }
      }
    }
  }

  private getUIState(): RecursivePartial<UIState>{
    const state = UI.getState();
    return {
      map: {
        mapChanges: {
          activeEntities: state.map.mapChanges.activeEntities,
          entityData: state.map.mapChanges.entityData
        },
        fullMap: {
          activeEntities: state.map.fullMap.activeEntities,
          entityData: state.map.fullMap.entityData
        }
      }
    };
  }

  private step(): StepReturn{
    this.runSystems();
    const uiState = this.getUIState();
    dispatch(endStep());
    return {
      ui: {
        map: {
          activeEntities: uiState.map.mapChanges.activeEntities,
          entityData: uiState.map.mapChanges.entityData
        }
      }
    };
  }

  public *run(): Iterator<StepReturn>{
    if(!this.playing){
      this.scene.initNewGame();
    }
    this.playing = true;

    while(this.playing){
      yield this.step();
    }
  }

  public stop(): void{
    this.playing = false;
  }
}
