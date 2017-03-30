import * as PIXI from "pixi.js";
import {SpriteId} from "./Enum";
import {StepReturn} from "./Engine";
import {UIMapPart} from "./UIState";
import Entity from "./ecs/Entity";

const atlasPath = "images/atlas.json";
const tileSize = 32;
const screenWidth = tileSize * 20;
const screenHeight = tileSize * 15;

export default class Renderer{
  private atlasLoader: PIXI.loaders.Loader;
  private textures: PIXI.loaders.ITextureDictionary;
  private stage: PIXI.Container;
  private pixiRenderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  private spriteCache: Map<Entity, PIXI.Sprite>;

  constructor(){
    this.atlasLoader = PIXI.loader.add(atlasPath).load(() => {
      this.textures = this.atlasLoader.resources[atlasPath].textures;
    });
    this.stage = new PIXI.Container();
    this.pixiRenderer = PIXI.autoDetectRenderer(screenWidth, screenHeight, {clearBeforeRender: false});
    this.pixiRenderer.preserveDrawingBuffer = true;
    this.spriteCache = new Map();
  }

  public getSprite(spriteId: SpriteId): PIXI.Sprite{
    const filename = SpriteId[spriteId];

    if(this.textures.hasOwnProperty(filename)){
      return new PIXI.Sprite(this.textures[filename]);
    }

    throw new Error(`No such sprite: ${filename}`);
  }

  public render(state: StepReturn): void{
    const mapData = state.ui && <UIMapPart>state.ui.map;
    if(mapData){
      mapData.activeEntities.sort((a, b) => {
        const aData = mapData.entityData[a];
        const bData = mapData.entityData[b];
        return aData.layer - bData.layer;
      }).forEach(entity => {
        const entityRenderData = mapData.entityData[entity];
        if(entityRenderData){
          var sprite: PIXI.Sprite;
          if(!this.spriteCache.has(entity)){
            sprite = this.getSprite(entityRenderData.spriteId);
            this.spriteCache.set(entity, sprite);
            this.stage.addChild(sprite);
          }else{
            sprite = this.spriteCache.get(entity);
          }

          sprite.x = entityRenderData.x * tileSize;
          sprite.y = entityRenderData.y * tileSize;

          /*
          const t = new PIXI.Text(`${entityRenderData.x},${entityRenderData.y},${entity}`,  {fontSize: 8});
          t.x = sprite.x;
          t.y = sprite.y;
          this.stage.addChild(t);
          */
        }
      });
    }

    this.pixiRenderer.render(this.stage);
  }

  public attach(element: HTMLElement): void{
    element.appendChild(this.pixiRenderer.view);
  }
}
