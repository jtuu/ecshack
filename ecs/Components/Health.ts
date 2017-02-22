import {Component, ComponentState} from "./Component";
import {ComponentEnum} from "../../Enum";

export interface HealthState extends ComponentState{
  currentHp: number;
  maxHp: number;
}

export interface HealthComponent extends Component<HealthState>{
  state: HealthState;
}

export const Health: HealthComponent = {
  enum: ComponentEnum.Health,
  name: ComponentEnum[ComponentEnum.Health],
  state: {
    currentHp: null,
    maxHp: null
  }
}
