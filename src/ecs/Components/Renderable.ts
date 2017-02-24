import {Component, ComponentState} from "./Component";
import {ComponentEnum} from "../../Enum";

export interface RenderableState extends ComponentState{
  char: string;
  sprite: HTMLImageElement;
}

export interface RenderableComponent extends Component<RenderableState>{
  state: RenderableState;
}

export const Renderable: RenderableComponent = {
  enum: ComponentEnum.Renderable,
  name: ComponentEnum[ComponentEnum.Renderable],
  state: {
    char: "?",
    sprite: new Image()
  }
}
