import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface ConstantPositionState extends ComponentState{
  x: number;
  y: number;
}

export interface ConstantPositionComponent extends Component<ConstantPositionState>{
  state: ConstantPositionState;
}

export const ConstantPosition: ConstantPositionComponent = {
  enum: ComponentType.ConstantPosition,
  name: ComponentType[ComponentType.ConstantPosition],
  state: {
    x: null,
    y: null
  }
}
