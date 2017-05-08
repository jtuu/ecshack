import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface SolidState extends ComponentState{}

export interface SolidComponent extends Component<SolidState>{
  state: SolidState;
}

export const Solid: SolidComponent = {
  enum: ComponentType.Solid,
  name: ComponentType[ComponentType.Solid],
  state: {}
}
