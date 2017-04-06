import {Component, ComponentState} from "./Component";
import {ComponentType, SpriteId} from "../../Enum";

export interface RenderableState extends ComponentState{
  screenX: number;
  screenY: number;
  spriteId: SpriteId;
  needsUpdate: boolean;
  layer: number;
}

export interface RenderableComponent extends Component<RenderableState>{
  state: RenderableState;
}

export const Renderable: RenderableComponent = {
  enum: ComponentType.Renderable,
  name: ComponentType[ComponentType.Renderable],
  state: {
    screenX: null,
    screenY: null,
    spriteId: null,
    needsUpdate: true,
    layer: 0
  }
}
