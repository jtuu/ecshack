import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface FlickerState extends ComponentState{
  alpha: number;
  rate: number;
  counter: number;
}

export interface FlickerComponent extends Component<FlickerState>{
  state: FlickerState;
}

export const Flicker: FlickerComponent = {
  enum: ComponentType.Flicker,
  name: ComponentType[ComponentType.Flicker],
  state: {
    alpha: 1,
    rate: 5,
    counter: 0
  }
}
