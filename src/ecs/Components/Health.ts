import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";

export interface HealthState extends ComponentState{
  currentHp: number;
  maxHp: number;
}

export interface HealthComponent extends Component<HealthState>{
  state: HealthState;
}

export const Health: HealthComponent = {
  enum: ComponentType.Health,
  name: ComponentType[ComponentType.Health],
  state: {
    currentHp: null,
    maxHp: null
  }
}
