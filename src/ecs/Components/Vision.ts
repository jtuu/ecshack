import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";
import {Fov} from "../../Fov";

export interface VisionState extends ComponentState{
  radius: number;
  fov: Fov;
  shouldRender: boolean;
}

export interface VisionComponent extends Component<VisionState>{
  state: VisionState;
}

const defaultRadius = 8;
export const Vision: VisionComponent = {
  enum: ComponentType.Vision,
  name: ComponentType[ComponentType.Vision],
  state: {
    radius: defaultRadius,
    get fov(){
      return new Fov(defaultRadius);
    },
    shouldRender: false
  }
}
