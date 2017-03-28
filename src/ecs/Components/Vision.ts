import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface VisionState extends ComponentState{
  fov: Array<any>;
}

export interface VisionComponent extends Component<VisionState>{
  state: VisionState;
}

export const Vision: VisionComponent = {
  enum: ComponentType.Vision,
  name: ComponentType[ComponentType.Vision],
  state: {
    fov: null
  }
}
