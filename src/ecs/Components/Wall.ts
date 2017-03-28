import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface WallState extends ComponentState{

}

export interface WallComponent extends Component<WallState>{
  state: WallState;
}

export const Wall: WallComponent = {
  enum: ComponentType.Wall,
  name: ComponentType[ComponentType.Wall],
  state: {

  }
}
