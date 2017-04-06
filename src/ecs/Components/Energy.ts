import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface EnergyState extends ComponentState{
  speed: number;
  energy: number;
}

export interface EnergyComponent extends Component<EnergyState>{
  state: EnergyState;
}

export const Energy: EnergyComponent = {
  enum: ComponentType.Energy,
  name: ComponentType[ComponentType.Energy],
  state: {
    speed: null,
    energy: null
  }
}
