import {Component, ComponentState} from "./Component";
import {ComponentEnum} from "../../Enum";

export interface ConstantPositionState extends ComponentState{
  x: number;
  y: number;
}

export interface ConstantPositionComponent extends Component<ConstantPositionState>{
  state: ConstantPositionState;
}

export const ConstantPosition: ConstantPositionComponent = {
  enum: ComponentEnum.ConstantPosition,
  name: ComponentEnum[ComponentEnum.ConstantPosition],
  state: {
    x: null,
    y: null
  }
}
