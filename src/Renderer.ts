import * as PIXI from "pixi.js";
import {SpriteId} from "./Enum";
import {StepReturn} from "./Engine";
import {UIMapPart} from "./UIState";
import Entity from "./ecs/Entity";

const atlasPath = "images/atlas.json";
const unseeAlpha = 0.5;

export default class Renderer{
  private atlasLoader: PIXI.loaders.Loader;
  private textures: PIXI.loaders.ITextureDictionary;
  private stage: PIXI.Container;
  private layers: Array<PIXI.Container> = [];
  private pixiRenderer: PIXI.WebGLRenderer;
  private spriteCache: Map<Entity, PIXI.Sprite>;

  constructor(){
    this.atlasLoader = PIXI.loader.add(atlasPath).load(() => {
      this.textures = this.atlasLoader.resources[atlasPath].textures;
    });
    this.stage = new PIXI.Container();
    this.pixiRenderer = new PIXI.WebGLRenderer(SCREEN_WIDTH, SCREEN_HEIGHT, {clearBeforeRender: false});
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
      mapData.activeEntities.forEach(entity => {
        const entityRenderData = mapData.entityData[entity];
        if(entityRenderData){
          var sprite: PIXI.Sprite;
          if(!this.spriteCache.has(entity)){
            if(entityRenderData.spriteId === undefined){
              throw entity;
            }
            sprite = this.getSprite(entityRenderData.spriteId);
            if(TILE_SCALE !== 1.0) sprite.scale.set(TILE_SCALE, TILE_SCALE);
            this.spriteCache.set(entity, sprite);

            var layer = this.layers[entityRenderData.layer];
            if(!layer){
              layer = new PIXI.Container();
              layer["zIndex"] = entityRenderData.layer;
              this.layers[entityRenderData.layer] = layer;
              this.stage.addChild(layer);

              this.stage.children.sort((a, b) => a["zIndex"] - b["zIndex"])
            }
            layer.addChild(sprite);
          }else{
            sprite = this.spriteCache.get(entity);
          }

          const screenX = entityRenderData.x * TILE_SIZE;
          const screenY = entityRenderData.y * TILE_SIZE;

          if(sprite.x !== screenX){
            sprite.x = screenX;
          }
          if(sprite.y !== screenY){
            sprite.y = screenY;
          }

          if(entityRenderData.unsee && sprite.visible){
            //XXX: setting alpha causes flickering ??
            //sprite.alpha = unseeAlpha;
            sprite.visible = false;
          }else if(entityRenderData.alpha && sprite.alpha !== entityRenderData.alpha){
            sprite.alpha = entityRenderData.alpha;
          }else if(!sprite.visible){
            sprite.visible = true;
          }
        }
      });
    }

    this.pixiRenderer.render(this.stage);
  }

  public attach(element: HTMLElement): void{
    element.appendChild(this.pixiRenderer.view);
  }
}
